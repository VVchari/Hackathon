from flask import Flask, request, jsonify
from rapidfuzz import process, fuzz

app = Flask(__name__)

@app.route('/match-courses', methods=['POST'])
def match_courses():
    try:
        # Validate request data
        data = request.json
        if not data:
            return jsonify({"error": "No JSON data received"}), 400
            
        resume_courses = data.get('resume_courses', [])
        standard_courses = data.get('standard_courses', [])
        
        print("Received data:", {
            "resume_courses": resume_courses,
            "standard_courses": standard_courses
        })

        # Validate input arrays
        if not isinstance(resume_courses, list) or not isinstance(standard_courses, list):
            return jsonify({"error": "Invalid input format"}), 400
            
        # Check for empty course lists
        if not standard_courses:
            return jsonify({
                "warning": "No standard courses provided",
                "completed_courses": [],
                "standard_credits": 0
            })

        # Lowercase and strip resume course names for better matching
        resume_names = [course.lower().strip() for course in resume_courses if course]
        
        if not resume_names:
            return jsonify({
                "warning": "No valid resume courses provided",
                "completed_courses": [],
                "standard_credits": 0
            })

        # Build a list of standard names and mapping
        standard_names = []
        course_mapping = []
        
        for idx, course in enumerate(standard_courses):
            try:
                name = course.get("course name", "").lower().strip()
                if not name:
                    continue
                    
                standard_names.append(name)
                course_mapping.append(idx)
                
                # Add alternative paths if they exist
                for alt_key in ["alternative path 1", "alternative path 2"]:
                    if alt_name := course.get(alt_key, "").strip():
                        standard_names.append(alt_name.lower())
                        course_mapping.append(idx)
                        
            except (KeyError, AttributeError) as e:
                print(f"Warning: Invalid course data: {e}")
                continue

        if not standard_names:
            return jsonify({
                "warning": "No valid standard course names found",
                "completed_courses": [],
                "standard_credits": 0
            })

        # Course matching with fuzzy logic
        threshold = 70
        completed_courses = []
        standard_credits = 0
        matched_indices = set()

        for resume in resume_names:
            match_result = process.extractOne(
                resume, standard_names, scorer=fuzz.ratio
            )
            
            if match_result is None:
                continue
                
            best_match, score, match_index = match_result
            
            if score >= threshold:
                course_idx = course_mapping[match_index]
                if course_idx not in matched_indices:
                    completed_courses.append(standard_courses[course_idx]["course name"])
                    try:
                        standard_credits += int(standard_courses[course_idx].get("credits", 0))
                    except (ValueError, TypeError) as e:
                        print(f"Warning: Invalid credits for course: {standard_courses[course_idx]}")
                    matched_indices.add(course_idx)

        return jsonify({
            "completed_courses": completed_courses,
            "standard_credits": standard_credits
        })

    except Exception as e:
        print(f"Error processing request: {str(e)}")
        return jsonify({
            "error": str(e),
            "completed_courses": [],
            "standard_credits": 0
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)