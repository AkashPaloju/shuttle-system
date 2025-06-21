
const calculateFare = (route, sourceId, destinationId) => {
  const stopIds = route.stops.map(stop => stop._id.toString());
  const sourceIndex = stopIds.indexOf(sourceId);
  const destIndex = stopIds.indexOf(destinationId);

  if (sourceIndex === -1 || destIndex === -1 || sourceIndex >= destIndex) {
    return null; // invalid
  }

  const numHops = destIndex - sourceIndex;
  const farePerStop = 10;
  return numHops * farePerStop;
};

const calculateTravelTime = (route, sourceId, destinationId) => {
  const stopIds = route.stops.map(stop => stop._id.toString());
  const sourceIndex = stopIds.indexOf(sourceId);
  const destIndex = stopIds.indexOf(destinationId);

  if (sourceIndex === -1 || destIndex === -1 || sourceIndex >= destIndex) {
    return null;
  }

  const numHops = destIndex - sourceIndex;
  const timePerStop = 5; // in minutes
  return numHops * timePerStop;
};

const calculateArrivalTimeAtStop = (route, sourceId) => {
  const stopIds = route.stops.map(stop => stop._id.toString());
  const sourceIndex = stopIds.indexOf(sourceId);

  if (sourceIndex === -1) {
    return null; // invalid
  }

  const timePerStop = 5; // in minutes
  const timeToPickup = sourceIndex * timePerStop;
  const rideStartTime = route.timingSlots[0].startTime; // assuming first slot is the ride start time
  // The time will be in format "HH:mm"
  const [hours, minutes] = rideStartTime.split(':').map(Number);
  const arrivalTime = new Date();
  arrivalTime.setHours(hours, minutes + timeToPickup, 0, 0);
  return arrivalTime;
};


export { calculateFare, calculateTravelTime, calculateArrivalTimeAtStop };
