import React, {useState} from "react";


const ROLES = ["Doctor", "NMT", "Patient", "Scan"];
const ROLECOLORS = {
    Doctor: "khaki",
    NMT: "lightblue",
    Patient: "lightpink",
    Scan: "lightgreen"
};

// 
export default function Schedule({timeSlots, parentSchedule, setSchedule, available, appointment, baseDay}) {
    // state: { "8:00 AM": { Doctor: 0, NMT: 0, Patient: 0, Scan: 0 }, ... }
    console.log("available", available, "appointment", appointment);

    //state for busy or available
    const [hoveredCell, setHoveredCell] = useState(null);
    
    const handleCellMouseEnter = (time, role) => {
        setHoveredCell({ time, role });
    };

    const handleCellMouseLeave = () => {
        setHoveredCell(null);
    };

    // this changes the number to 1 or 0 with param time and role
    const handleCellClick = (time, role) => {
        // we go off previous state
        setSchedule(prev => ({
            //spread the previous table 
            ...prev,
            // choose the time we want to change
            [time]: {
                // copy the previous table time row
                ...prev[time],
                // choose the role we want to change 1 or 0   
                [role]: prev[time][role] === 0 ? 1 : 0,
            },
        }));
    };



    const isAppointment = (rowIndex, colIndex) => {
        // safety checks
        if (available === null ||
            !appointment ||
            !Array.isArray(appointment) ||
            appointment.length === 0) {
            return false;
        }
        // this sum works to highlight the appointment
        let sum = 0
        const offset = rowIndex - available;
        if (offset < 0 || offset >= appointment.length) return false;
        sum++
        const patternRow = appointment[offset]; // like [0,0,1,1]
        if (patternRow[colIndex] === 1) sum++;
        return sum;
    };

    return (
        <div style={{fontFamily: "sans-serif" }}>
            <table
                style={{ borderCollapse: "collapse", marginTop: "10px"}}
                border="1"
            >
                <thead>
                    <tr>
                        <th colSpan={ROLES.length + 1}>{baseDay}</th>
                    </tr>
                    <tr>
                        <th style={{width: "125px" }}>Time</th>
                        
                        {ROLES.map(role => 
                            // map the roles accordingly
                            (<th key={role} style={{width: "125px"}}>{role}</th>))}
                    </tr>
                </thead>
            <tbody>
                {timeSlots.map((time, rowIndex) => {
                    const isHour = time.endsWith(":45 AM") || time.endsWith(":45 PM");
                    const borderStyle = isHour ? {borderBottom: "3px solid black"} : {};
                    
                    return (
                    <tr key={time}>
                    <td
                        style={{
                        fontWeight: "bold",
                        backgroundColor: "#242424",
                        ...borderStyle,
                        }}
                    >
                        {time}
                    </td>
                    {ROLES.map((role, colIndex) => {
                        
                        // defines the color swap
                        
                        const isAppt = isAppointment(rowIndex, colIndex);
                        const value = isAppt === 2 ? 1 : parentSchedule[time][role];
                        const isSelected = value === 1;
                        let bg = "white";
                        if(isAppt == 2)bg = "red";
                        else if (isSelected)bg = ROLECOLORS[role];
                        return (
                        <td
                            key={role}
                            onClick={() => handleCellClick(time, role)}
                            onMouseEnter={() => handleCellMouseEnter(time, role)}
                            onMouseLeave={handleCellMouseLeave}
                            style={{
                            padding: "1px 1px",
                            textAlign: "center",
                            cursor: "pointer",
                            backgroundColor: bg,
                            color: "black",
                            userSelect: "none",
                            ...borderStyle,
                            }}
                        >
                            {hoveredCell && hoveredCell.time == time && hoveredCell.role == role ?
                            (isSelected ? "Busy" : "Available") : ("")}
                         </td>);
                    })}
                    </tr>
                )})}
            </tbody>
            </table>
        </div>
    );
}
