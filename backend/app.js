fetch("https://api.imd.gov.in/api/v1/staterainfall")
  .then(res => {
    console.log("Status:", res.status);
    return res.json();
  })
  .then(data => console.log(data))
  .catch(err => console.error(err));