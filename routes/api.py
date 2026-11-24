# REST API for the Next.js frontend
from flask import Blueprint, jsonify, request
from models import job_search_model

api_bp = Blueprint("api", __name__, url_prefix="/api")
REQUIRED = ("title", "category", "employer", "location", "salary", "phone", "description")


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
    return None


def normalize_job(data):
    job = {key: data[key].strip() for key in REQUIRED}
    for field in ("title_hi", "employer_hi", "location_hi", "salary_hi", "description_hi"):
        value = data.get(field)
        if isinstance(value, str) and value.strip():
            job[field] = value.strip()
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
    data = request.get_json(silent=True)
    error = validate_job(data)
    if error:
        return jsonify({"error": error}), 400
    job = job_search_model.update_job(job_id, normalize_job(data))
    return (jsonify({"job": job}), 200) if job else (jsonify({"error": "Job not found."}), 404)


@api_bp.delete("/jobs/<int:job_id>")
def delete_job(job_id):
    if not job_search_model.delete_job(job_id):
        return jsonify({"error": "Job not found."}), 404
    return jsonify({"message": "Job deleted."})


@api_bp.get("/profile/<employer_name>")
def get_employer_jobs(employer_name):
    jobs = job_search_model.get_jobs_by_employer(employer_name)
    return jsonify({"jobs": jobs, "employer": employer_name})

