const express = require("express");
const app = express();
const port = process.env.PORT || 3000

app.use("/static", express.static('./static/'));


app.get('/', (req, res) => {
  res.sendFile('static/index.html', {root: __dirname })
})

app.use(express.static(__dirname + "/static"));

app.listen(port, () => {
  console.log(`TravelSight listening on port ${port}`)
})

