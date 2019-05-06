const fetches = async () => {
  try {
    const res = await fetch('https://httpbin.org/get');
    console.log(await res.json());
  } catch (error) {
    console.error(error);
  }

  try {
    const res = await fetch('https://httpbin.org/get', {
      headers: {
        'x-mockyeah-suite': 'mySuite'
      }
    });
    console.log(await res.json());
  } catch (error) {
    console.error(error);
  }
};

export default fetches;
