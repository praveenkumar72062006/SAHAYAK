# REST API for the Next.js frontend
from flask import Blueprint, jsonify, request
from models import job_search_model

api_bp = Blueprint("api", __name__, url_prefix="/api")
REQUIRED = ("title", "category", "employer", "location", "salary", "phone", "description")


def extract_pin(req, body=None):
    """Extract employer PIN from headers, request body, or query params."""
    pin = req.headers.get("X-Employer-Pin", "").strip()
    if pin:
        return pin
    auth = req.headers.get("Authorization", "").strip()
    if auth.startswith("Bearer "):
        return auth[7:].strip()
    if isinstance(body, dict) and body.get("pin"):
        return str(body["pin"]).strip()
    return req.args.get("pin", "").strip()


def verify_job_ownership(job, pin):
    """Check if provided PIN matches job PIN (default demo PIN: 1234)."""
    expected = str(job.get("pin") or "1234").strip()
    return bool(pin and pin == expected)


def validate_job(data):
    if not isinstance(data, dict):
        return "Send a JSON object."
    for field in REQUIRED:
        value = data.get(field)
        if not isinstance(value, str) or not value.strip():
            return f"{field.replace('_', ' ').capitalize()} is required."
        if len(value.strip()) > (2000 if field == "description" else 160):
            return f"{field.replace('_', ' ').capitalize()} is too long."
    if not data["phone"].strip().replace("+", "").replace(" ", "").replace("-", "").isdigit():
        return "Enter a valid phone number."
    pin = data.get("pin")
    if pin is not None and not str(pin).strip().isalnum():
        return "PIN must be alphanumeric (e.g., 4-digit code)."
    return None


def normalize_job(data):
    job = {key: data[key].strip() for key in REQUIRED}
    for field in ("title_hi", "employer_hi", "location_hi", "salary_hi", "description_hi"):
        value = data.get(field)
        if isinstance(value, str) and value.strip():
            job[field] = value.strip()
    pin = str(data.get("pin") or "").strip()
    job["pin"] = pin if pin else "1234"
    return job


@api_bp.get("/jobs")
def get_jobs():
    search = request.args.get("search", "").strip()
    jobs = job_search_model.search_jobs(search) if search else job_search_model.jobs
    category = request.args.get("category", "").strip().casefold()
    location = request.args.get("location", "").strip().casefold()
    if category:
        jobs = [job for job in jobs if job.get("category", "").casefold() == category]
    if location:
        jobs = [job for job in jobs if location in job.get("location", "").casefold()]
    return jsonify({"jobs": jobs, "search": search})


@api_bp.get("/jobs/<int:job_id>")
def get_job(job_id):
    job = job_search_model.get_job_by_id(job_id)
    return (jsonify({"job": job}), 200) if job else (jsonify({"error": "Job not found."}), 404)


@api_bp.post("/jobs")
def create_job():
    data = request.get_json(silent=True)
    error = validate_job(data)
    if error:
        return jsonify({"error": error}), 400
    job = job_search_model.add_job(normalize_job(data))
    return jsonify({"job": job}), 201


@api_bp.route("/jobs/<int:job_id>", methods=["PUT"])
def update_job(job_id):
    job = job_search_model.get_job_by_id(job_id)
    if not job:
        return jsonify({"error": "Job not found."}), 404

    data = request.get_json(silent=True)
    error = validate_job(data)
    if error:
        return jsonify({"error": error}), 400

    pin = extract_pin(request, data)
    if not verify_job_ownership(job, pin):
        return jsonify({"error": "Unauthorized: Invalid employer PIN for this listing. Default demo PIN is 1234."}), 403

    normalized = normalize_job(data)
    if "pin" not in data and "pin" in job:
        normalized["pin"] = job["pin"]

    updated = job_search_model.update_job(job_id, normalized)
    return jsonify({"job": updated}), 200


@api_bp.delete("/jobs/<int:job_id>")
def delete_job(job_id):
    job = job_search_model.get_job_by_id(job_id)
    if not job:
        return jsonify({"error": "Job not found."}), 404

    data = request.get_json(silent=True)
    pin = extract_pin(request, data)
    if not verify_job_ownership(job, pin):
        return jsonify({"error": "Unauthorized: Invalid employer PIN for this listing. Default demo PIN is 1234."}), 403

    if not job_search_model.delete_job(job_id):
        return jsonify({"error": "Job not found."}), 404
    return jsonify({"message": "Job deleted."})


@api_bp.post("/auth/verify-employer")
def verify_employer():
    data = request.get_json(silent=True) or {}
    employer = str(data.get("employer") or "").strip()
    pin = str(data.get("pin") or "").strip()
    if not employer:
        return jsonify({"error": "Employer name is required."}), 400
    if not pin:
        return jsonify({"error": "Employer PIN is required."}), 400

    jobs = job_search_model.get_jobs_by_employer(employer)
    if not jobs:
        return jsonify({"authenticated": True, "employer": employer, "jobsCount": 0, "isNew": True}), 200

    if not any(verify_job_ownership(j, pin) for j in jobs):
        return jsonify({"error": "Invalid PIN for this employer name. Default demo PIN is 1234."}), 403

    return jsonify({"authenticated": True, "employer": employer, "jobsCount": len(jobs)}), 200


@api_bp.get("/profile/<employer_name>")
def get_employer_jobs(employer_name):
    pin = extract_pin(request)
    jobs = job_search_model.get_jobs_by_employer(employer_name)
    authenticated = any(verify_job_ownership(j, pin) for j in jobs) if (pin and jobs) else False
    return jsonify({"jobs": jobs, "employer": employer_name, "authenticated": authenticated})
