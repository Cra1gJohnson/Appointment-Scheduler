from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np

app = Flask(__name__)
CORS(app, resources={
    r"/*":{"origins": "http://localhost:5173"}
})   # allows all origins to reach flask app 


ROLES = ["Doctor", "NMT", "Patient", "Scan"]  # for the schedule matrix

# this completes MJ's proposed solution

def find_fit_numpy(large, small):
    # create np arrays to using bitwise ops
    large = np.array(large)
    small = np.array(small)

    # grab shapt
    L, cols = large.shape
    A = small.shape[0]
    # gonna hold our available indices
    positions = []

    # how many appts we can fit
    for start in range(L - A + 1):
        #start stop step on the 2d array to return out proposed schedule
        submatrix = large[start:start+A, :]
        # bitwise opp so there are no overlaps
        if np.all((submatrix + small) <= 1):  # no overlap
            positions.append(start)

    return positions

@app.route("/submit", methods=["POST"])
def submit():
    data = request.get_json()

    schedule = data["schedule"]
    appt_struct = data["appointmentStructure"]

    time_keys = list(schedule.keys())  # insertion order from JSON

    schedule_matrix = [
        [schedule[time][role] for role in ROLES]
        for time in time_keys
    ]


    # grab 
    rows = sum(appt_struct["times"]) // 15  #[15, 30, 60, 60, 30]   
    times = appt_struct["times"]
    remaining = list(times)

    # Option A: 2×N matrix: first row roles, second row times
    structure_matrix = []
    indx = 0
    for i in range(rows):
        if times[indx] == 0 :
            # increment personel
            indx += 1
        # depending on which part of the structure we are determines the person needed
        if indx == 0 or indx == 4:
            structure_matrix.append([1,0,1,0])
        elif indx == 1:
            structure_matrix.append([0,1,1,0])
        elif indx == 3:
            structure_matrix.append([0,0,1,1])
        else :
            structure_matrix.append([0,0,1,0])
        times[indx] -= 15
    
    positions = find_fit_numpy(schedule_matrix, structure_matrix)
    if positions:
        print(positions)
        return jsonify({
            "all_positions": positions,
            "lenth": rows,
            "appointment": structure_matrix,
            "message": "Fit found!"
        })
    else:
        return jsonify({"message": "No available slot"}), 200
    
    
    
if __name__ == "__main__":
    app.run(debug=True)