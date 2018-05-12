const moment = require('moment');

const generateLocation = (lng , lat)=>{
  return{
    lng,
    lat,
    createdAt: moment() // default to the current date {not formatted yet}
  }
}

const generateMarkerPosition = (position)=>{
  return{
    position,
    createdAt: moment() // default to the current date {not formatted yet}
  }
}

const generateNotification = (text,count) =>{
  return {
    text,
    count: count-1,
    createdAt: moment() // default to the current date {not formatted yet}
  }
}

const generatePlace = (place) =>{
  return {
    place,
    createdAt: moment() // default to the current date {not formatted yet}
  }
}

const generateCount = (count)=>{

  return{
    count: count,
    createdAt: moment() // default to the current date {not formatted yet}
  }
}
module.exports = { generateLocation, generateMarkerPosition, generateNotification, generatePlace, generateCount };
