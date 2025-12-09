import { useState, useMemo, useEffect } from "react";
import AppointmentStructure from "./components/AppointmentStructure";
import Schedule from "./components/Schedule";
import './App.css';
const ROLES = ["Doctor", "NMT", "Patient", "Scan"];
const TIMES = ["15", "30", "60", "60", "30"];
const STRUCTURE = ["Doctor", "NMT", "Rest", "Scan", "Doctor"];
const DAY = "Monday";


// Helper to generate the time slots for schedule
function generateTimeSlots(startHour = 8, endHour = 17, intervalMinutes = 15) {
    const slots = [];

    function formatTime(hour24, minutes) {
      const suffix = hour24 >= 12 ? "PM" : "AM";
      let hour12 = hour24 % 12;
      if (hour12 === 0) 
        // format the 12 hour clock with 2 digits
        hour12 = 12;
        const mins = String(minutes).padStart(2, "0");
      return `${hour12}:${mins} ${suffix}`;
    }

    for (let hour = startHour; hour < endHour; hour++) {
      for (let min = 0; min < 60; min += intervalMinutes) {
        slots.push(formatTime(hour, min));
      }
    }

  return slots;
};

// initializes a blank schedule
function initSchedule(timeSlots, roles) {
  const result = {};
  for (const time of timeSlots) {
    result[time] = {};
    for (const role of roles) {
      result[time][role] = 0;
    }
  }
  return result;
};


export default function App() {

  // times for appointment structure
  const [baseTimes, changeTimes] = useState(TIMES);
  // this memoiz the timeslot generation
  const timeSlots = useMemo( () => generateTimeSlots(), []); 
  // initialize a parent schedule state
  const [parentSchedule, setSchedule] = useState(() => initSchedule(timeSlots, ROLES));
  // day state
  const [baseDay, onSetDay] = useState(DAY);

  // this marks return from the backend
  
  const [available, setAvailable] = useState(null);
  const [availableArray, setAvailableArray] = useState(null);
  const [appointment, setAppointment] = useState(null);
  const [message, setMessage] = useState("");
  // cycling through appointments
  const [availableLength, setLength] = useState(null)
  const [index, setIndex] = useState(0);

  // 
  useEffect(() => {
    setSchedule(() => initSchedule(timeSlots,ROLES));
    setAvailable(null);
    setAppointment(null);
    setMessage("");
  }, [baseDay]);
  
  useEffect(() => {
    if (available === null || !appointment || !appointment.length) return;
    const apptTime = timeSlots[available];
    const apptLength = appointment.length * 15;
    if (index === 0){
      setMessage("Next appointment is at " + apptTime + " lasting " + apptLength + " minutes.");  
    }
    else {
      setMessage("Current appointment is at " + apptTime + " lasting " + apptLength + " minutes.");
    }
    
  }, [available]);

  useEffect(() => {
    if (availableArray != null){
      setAvailable(availableArray[index]);
    }
    
  }, [index]);

  // changes appointment time structure
  const handleSetTimes = (newTimes) => {
    changeTimes(newTimes);
    console.log("saved new times");
    setAvailable(null);
    setAppointment(null);
    setMessage("");
  };

  // hande the api fetch to backend and package the objects
  const handleSubmit = async () => {
      const payload = {
        schedule: parentSchedule,
        appointmentStructure: {
          roles : STRUCTURE,
          times: baseTimes.map(Number),
        },
      };
      try {
        const res = await fetch("http://localhost:5000/submit", {
          method: "POST",
          headers: {
            "Content-Type" : "application/json",

          },
          body: JSON.stringify(payload),
        });
        const data = await res.json();

        console.log("server responded", data.all_positions, data.appointment);
        
        // if server responds with no available slot
        if(data.message === "No available slot"){
          alert("no available slot");
          return;
        }
        const posLength = data.all_positions.length - 1;
        const apptTime = timeSlots[data.all_positions[0]];
        const apptLength = data.appointment.length * 15;
        //setReturning(data.all_positions)
        // else we set the new appointment and the structure
        setLength(posLength);
        setIndex(0);
        setAvailableArray(data.all_positions);
        setAvailable(data.all_positions[index]);
        setAppointment(data.appointment);
      // catch an error
      } catch(err) {
        console.error("Error submitting:", err);
        alert("Error submitting");
      }
  };

  // this handles the accept button
  const handleAccept = () => {
    if (available === null || !appointment || !appointment.length) return;
    
    //  this uses similar logic to click in schedule
    // modify the previous state of schedule
    const apptTime = timeSlots[available];
    const apptLength = appointment.length * 15;
    const conf = 
    confirm("Confirm appointment for " + apptTime + " lasting " + apptLength + " minutes.");
    if (conf) {
      setSchedule(prev => {
        // spread previous
        const newSchedule = { ...prev };
        
        // go through appointment structure value and index
        appointment.forEach((patternRow, offset) => {
          // start from available 
          const rowIndex = available + offset;
          // this is checking if we are querying outside of timeslot
          const time = timeSlots[rowIndex];
          if (!time) return; // safety

          // copy row so we don't mutate prev directly
          const rowCopy = { ...newSchedule[time] };
          
          // this matches the roles to the table
          ROLES.forEach((role, colIndex) => {
            // role is busy in appoinment structure
            if (patternRow[colIndex] === 1) {
              rowCopy[role] = 1; // mark as busy
            }
          });
          // assign the new schedule to the modified row
          newSchedule[time] = rowCopy;
        });

        return newSchedule;
      });

    // clear the proposed appointment overlay
    
    }
    setAvailable(null);
    setAppointment(null);  
    setMessage("");
  };

  const handlePrev = () => {
    if (availableLength == 0) return ;
    setIndex(prev => {
      if (prev === 0){
        return availableLength;
      }
      else{
        return prev - 1;
      }
    });
  };
  const handleNext = () => {
    if (availableLength == 0) return ;
    setIndex(prev => {
      if (prev === availableLength){
        return 0;
      }
      else{
        return prev + 1;
      }
    });
  };

{/* <button 
            onClick={incrementPrev}
            disabled={available === null || !appointment}
            style={{ marginTop: 16, padding: "8px 16px", cursor: available === null ? "not-allowed" : "pointer" }}>
              Previous
            </button>
            <button 
            disabled={available === null || !appointment}
            style={{ marginTop: 16, padding: "8px 16px", cursor: available === null ? "not-allowed" : "pointer" }}>
              Next
            </button> */}


  return (
    <>
      <div id="main">
        <div id="appointment">
          <AppointmentStructure 
            baseTimes={baseTimes} 
            onSetTimes={handleSetTimes} 
            baseDay={baseDay} 
            onSetDay={onSetDay}/>
          <h4>
            Block out availability by clicking a table cell.<br/>
            White indicates available and a color indicates busy.<br/>
            Click "Find appointment" to display the soonest appointment.<br/><br/>

            
            Red indicates the cells that will change to busy if accepted.<br/>
            Click "Accept appointment" to modify schedule.<br/>
            Click "Previous" or "Next" to cycle through appointments.
          </h4> 
          <div >
            <button onClick={handleSubmit} style={{ marginTop: 16, padding: "8px 16px", cursor: "pointer" }}> 
            Find appointment
            </button>
          
          </div>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center"}}>
            <button 
              onClick={handlePrev}
              disabled={available === null || !appointment || availableLength == 0}
              style={{ marginTop: 16, padding: "8px 16px", 
                cursor: (available === null || availableLength == 0) ? "not-allowed" : "pointer" }}>
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={available === null || !appointment || availableLength == 0}
              style={{ marginTop: 16, padding: "8px 16px", 
                cursor: (available === null || availableLength == 0) ? "not-allowed" : "pointer" }}>
              Next
            </button>
          </div>
          <h4>{message}</h4>
          <button
            onClick={handleAccept}
            disabled={available === null || !appointment}
            style={{ marginTop: "2rem",  padding: "8px 16px", cursor: available === null ? "not-allowed" : "pointer" }}
          >
            Accept appointment
          </button>
        </div>
        <Schedule 
          timeSlots={timeSlots} 
          parentSchedule={parentSchedule} 
          setSchedule={setSchedule} 
          available={available}
          appointment={appointment}
          baseDay={baseDay}/>
      </div>
    </>
  )
};

