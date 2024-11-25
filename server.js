import express from "express";
import bodyParser from "body-parser";
import axios from "axios";


import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("xxx");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


const app = express();
const port = 3000;
const apikey = "xxx";
const apikey2 = "xxx";
const apiurl = "https://api.openweathermap.org/data/2.5/weather?units=metric";
const apiurl2 = "https://api.weatherapi.com/v1/current.json?";

app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

/* const prompt = "temperature - 26 degrees Celsius, humidity - 65%, sunlight hours - 9, soil type - well drained, wind speed - 0.5 mph is the above condition suitable for coffee planting/growing, give result in one line and then explain reason in five points";
model.generateContent(prompt) 
.then(result => { 
  const aidata = result.response.text();
  console.log(aidata);
  }) 
  .catch(error => { 
    console.error('Error:', error);
  }) */







function minutes(value){
  const timestamp = value;
    const date = new Date(timestamp * 1000); 
    const timeString = date.toTimeString().substring(0, 8);
    //console.log('Time:', timeString);
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + seconds / 60;
    return totalMinutes.toFixed(2);
}
function jsonmaker(data){
  let ret = [];
  let temp = data.split("**");
  for(let i =1; i<11; i++){
    let tem = temp[i];
    if((i%2 == 0) && (i != 10)){
      let len = tem.length;
      let temp2 = tem.substring(1, len-2) ;
      ret[i-1] = temp2;
      }else{
        ret[i-1] = tem;
      }
    } 
    return ret;
}




app.get("/", (req, res) => {
  res.render("index.ejs", { content: "bhopal",we : 'g', tem: "t", hum: 'h',wind: "j",hour: "hour", min: "min", AiData: "aidata",result: "MainLine" });
});

let data;

app.post("/", async (req, res) => {
  try {

    const cro = req.body.cr;
    


    const response = await axios.get(`${apiurl}&appid=${apikey}&q=${req.body.ci}`);
    console.log(response.data);
    const response2 = await axios.get(`${apiurl2}key=${apikey2}&q=${req.body.ci}`);
    console.log(response2.data);


    const sunrise = minutes(response.data.sys.sunrise);
    const sunset = minutes(response.data.sys.sunset);
    const sunshine = sunset - sunrise;
    const sunlight = sunshine/60;
    const hour = Math.floor(sunlight);
    const min = Math.round((sunlight - hour) * 60);


    model.generateContent("New Chat"); 
    const prompt = `temperature - ${response.data.main.temp} degrees Celsius, humidity - ${response.data.main.humidity}%, sunlight duration - ${hour} hours ${min} minutes, wind speed - ${response2.data.current.wind_mph} mph is the above condition suitable for ${cro} planting/growing, 
    give result in one line and then explain reason in three points and give the soil suggestion for given crop in forth point and suggest the plantable crop name that is idle for this weather in fifth point`;
    model.generateContent(prompt) 
    .then(result => { 
      const aidata = result.response.text();
      let line = aidata.split(".")[0];
      let MainLine = aidata.substring(0, line.length+2);
      let reason = jsonmaker(aidata);
      console.log(reason);
      res.render("index.ejs", { content: response.data,
                                we: response.data.weather[0].main,
                                tem: response.data.main.temp,
                                hum: response.data.main.humidity,
                                wind: response2.data.current.wind_mph,
                                hour: hour, min: min,
                                result: MainLine,
                                AiData: reason,
                                });
      
    //console.log(aidata);
    
    }) 
    .catch(error => { 
      console.error('Error:', error);
    })

    

  
  } catch (error) {
    res.status(500).json({ message: "Error fetching posts" });
  }
});




app.listen(port, () => {
  console.log(`server is running on http://localhost:${port}`);
});
