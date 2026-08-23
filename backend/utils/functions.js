function filterArrayOfObjectAndRemoveRepetitions(arr, property) {
  const uniqueValues = new Set();
  const filteredArr = arr.filter((obj) => {
    if (!uniqueValues.has(obj[property])) {
      uniqueValues.add(obj[property]);
      return true;
    }
    return false;
  });
  return filteredArr;
}

async function CheckAllRequiredFieldsAvailaible(req, fields, res) {
  return await fields.some((a) => {
    const value = req?.[a];
    if (value === null || value === undefined || value === "") {
      res
        .status(500)
        .json({ status: 500, message: `Please Fill the Required Field ${a}` });
      return true;
    }
    return false;
  });
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

module.exports = {
  filterArrayOfObjectAndRemoveRepetitions,
  CheckAllRequiredFieldsAvailaible,
  escapeRegex,
};
