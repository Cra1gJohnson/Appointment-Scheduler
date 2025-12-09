import React, { useEffect, useState } from "react";
// current structure where times can be modded
const STRUCTURE = ["Doctor", "NMT", "Rest", "Scan", "Doctor"];


// returns an interactive table that h
export default function AppointmentStructure({baseTimes, onSetTimes, baseDay, onSetDay}) {

    // state for the minutes row
    const [times, setTimes] = useState(baseTimes);
    
    // local day state
    const [day, setDay] = useState(baseDay)
    // which cell (by index) is currently being edited, or null
    const [editingIndex, setEditingIndex] = useState(null);

    //if parent changes then sync to draft
    useEffect(() => {
        onSetTimes(baseTimes);
    }, [baseTimes]);
    useEffect(() => {
        onSetDay(baseDay);
    }, [baseDay]);

    // handle editing
    const handleTimeChange = (index, newValue) => {
        setTimes(prev =>
            prev.map((t, i) => (i === index ? newValue : t))
        );
    };

    // this function checks the times or they are not sent.
    const handleSet = async () => {
        try {
                // first need divide each by 15 to check
                const invalid = [];
                times.forEach( (time) => { 
                    if(time > 120 || time % 15 !== 0) {
                        invalid.push(time);
                    }

                });

                if(invalid.length > 0){
                    alert("These values are not <= 120 min or divisible by 15");
                } else {
                    const conf = confirm("Would you like to change the Care Flow times and/or day?");
                    if(conf){
                        onSetTimes(times);
                        onSetDay(day);
                    } else {
                        onSetTimes(baseTimes);


                    }
                    
                }
        } catch (err) {
            console.error("Error submitting schedule:", err);
            alert("Error submitting schedule");
        }
    };

    return (
        <div style={{fontFamily: "sans-serif", display: "flex", 
            flexDirection: "column", alignItems: "center"}}>
            <h4>First select day of the week.<br/> 
                Next change the structure by selecting minutes box.<br/>
                Click "Set" when finished. 
            </h4>

            <table
                style={{ borderCollapse: "collapse", marginTop: "10px"}}
                border="1"
            > 
                <thead>
                    <tr>
                       
                        <th colSpan={STRUCTURE.length}>APPOINTMENT STRUCTURE (minutes)</th>
                    </tr>
                
                </thead>
                <tbody>
                    <tr>
                        <td colSpan={STRUCTURE.length} style={{ textAlign: "center"}}>
                            <select style={{ textAlign: "center", margin: "5px"}}
                                    value={day}
                                    onChange={(e) =>{
                                        const value = e.target.value;
                                        setDay(value);

                                    }}>
                                <option>Monday</option>
                                <option>Tuesday</option>
                                <option>Wednesday</option>
                                <option>Thursday</option>
                                <option>Friday</option>
                            </select>
                        </td>    
                    </tr>
                    <tr>
                        {STRUCTURE.map((place, idx) => (<td key={idx}>{place}</td>))}
                    </tr>
                    <tr>
                        {times.map((time, idx) => (
                            <td
                            key={idx}
                            onClick={() => setEditingIndex(idx)}
                            style={{ cursor: "pointer", textAlign: "center", width: "100px" }}
                            >
                                {editingIndex === idx ? (
                                <input
                                    type="number"
                                    autoFocus
                                    value={time}
                                    onChange={e => handleTimeChange(idx, e.target.value)}
                                    onBlur={() => setEditingIndex(null)}
                                    onKeyDown={e => {
                                        if (e.key === "Enter") e.target.blur(); // save & exit
                                        if (e.key === "Escape") setEditingIndex(null); // cancel
                                    }}
                                    style={{ width: "100px", textAlign: "center" }}
                                />
                                ) : (time)}
                            </td>
                        ))}
                    </tr>

                </tbody>
            </table>
            <button onClick={() => handleSet()}>
                    Set
            </button>
        </div>
    );
}
