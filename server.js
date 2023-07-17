const express = require('express');
const turf = require('@turf/turf');
const app = express();
const path = require('path');
const cors = require('cors');
app.use(cors());
const bodyParser = require('body-parser');
const port = 3000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

app.post('/areas', (req, res) => {

  const polygon = req.body.polygon
  
  const originalPolygon = turf.polygon([polygon]);
  const subPolygons = turf.hexGrid(turf.bbox(originalPolygon), 0.150, { units: 'kilometers' });

  const validSubPolygons = subPolygons.features.filter(subPolygon => {
    const isWithinPolygon = turf.booleanWithin(subPolygon, originalPolygon);
    return isWithinPolygon && subPolygon.geometry.coordinates[0].length >= 4;
  });

  //console.log(validSubPolygons.length);   
  res.json(validSubPolygons.map(item => item.geometry.coordinates[0]));
});

app.post('/lots', (req, res) => {
  const polygon = req.body.polygon
  //console.log(req.body)
  polygon.push(polygon[0])
  const polygonFeature = turf.polygon([polygon]);
  const envelope = turf.bbox(polygonFeature);
  const grid = turf.squareGrid(envelope, 10, { units: 'meters' });
  const lotes = grid.features.filter((lote) => {
    const point = turf.centroid(lote);
    return turf.booleanPointInPolygon(point, polygonFeature);
  });
  const lotesCoordenadas = lotes.map((lote) => {
    const coordinates = turf.getCoords(lote.geometry);
    return coordinates[0][0];
  });

  //console.log(lotesCoordenadas.length);
  res.json(lotesCoordenadas);

});

app.post('/image', (req, res) => {

  res.send(`${req.protocol}://${req.get('host')}/image.jpg`);

});

app.listen(port, () => {
  console.log(`server on`);
});

