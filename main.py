import os
from datetime import datetime as d, timedelta as td
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware


class Event(BaseModel):
    number: int
    info: str

class TimedEvent(BaseModel):
    number: int
    info: str
    time: str

class TimedEvents(BaseModel):
    timed_events: list[TimedEvent]

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/save-one-event")
def save_one_event(event: Event):
    if not os.path.exists("by_one_events.txt"):
        with open("by_one_events.txt", 'w') as file:
            pass

    with open("by_one_events.txt", 'a+') as file:
        file.write(f"{event.number}|{event.info}|{d.now() + td(hours=2)}\n")

    return event

@app.post("/save-all-events")
def save_all_events(timed_events: TimedEvents):
    if not os.path.exists("by_all_events.txt"):
        with open("by_all_events.txt", 'w') as file:
            pass

    with open("by_all_events.txt", 'a+') as file:
        for event in timed_events.timed_events:
            file.write(f"{event.number}|{event.info}|{event.time}\n")

@app.get("/get-by-one-events")
def get_by_one_events():
    events = []

    with open("by_one_events.txt", 'r') as file:
        while row := file.readline():
            try:
                number, info, time = row.strip().split('|')
                events.append({"number":number, "info":info, "time":time})
            except:
                pass

    return events

@app.get("/get-by-all-events")
def get_by_all_events():
    events = []

    with open("by_all_events.txt", 'r') as file:
        while row := file.readline():
            try:
                number, info, time = row.strip().split('|')
                events.append({"number":number, "info":info, "time":time})
            except:
                pass

    return events

@app.post("/clear-events")
def clear_events():
    with open("by_one_events.txt", 'w') as file:
        pass

    with open("by_all_events.txt", 'w') as file:
        pass

    return {"message":"Events are cleared"}

