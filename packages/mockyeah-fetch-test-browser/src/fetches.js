const fetches = async () => {
  try {
    const res = await fetch('https://httpbin.org/get');
    console.log(await res.json());
  } catch (error) {
    console.error(error);
  }

  try {
    const res = await fetch('https://example.local');
    console.log(await res.json());
  } catch (error) {
    console.error(error);
  }

  try {
    const res = await fetch('https://example.local?ok=true', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ up: 'yes' })
    });
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
