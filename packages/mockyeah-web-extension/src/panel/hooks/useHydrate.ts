import { useEffect, useState } from "react";
import { saveMock, getSavedData } from "../../api";

const useHydrate = ({ connected, pageLoad }) => {
  const [mockIds, setMockIds] = useState();
  const [gotSavedData, setGotSavedData] = useState(false);
  const [savedData, setSavedData] = useState();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(false);
  }, [pageLoad]);

  useEffect(() => {
    if (!gotSavedData) return;

    if (!connected) return;

    if (!savedData) {
      setHydrated(true);
      return;
    }

    if (!savedData.mocks) {
      setHydrated(true);
      return;
    }

    const saveMockPromises = savedData.mocks?.map(
      mock =>
        new Promise(resolve =>
          saveMock(
            undefined,
            {
              match: {
                url: mock[0].url,
                method: mock[0].method
              },
              response: {
                raw: mock[1].raw,
                json: mock[1].json,
                text: mock[1].text
              }
            },
            resolve
          )
        )
    );

    Promise.all(saveMockPromises)
      .then(savedMocks => {
        const ids: string[] = [];
        savedMocks.forEach(savedMock => {
          // @ts-ignore
          ids.push(savedMock.result.id);
        });

        setMockIds(ids);
        setHydrated(true);
      })
      .catch(error => {
        console.error(error);
        setHydrated(true);
      });
  }, [connected, pageLoad, savedData]);

  useEffect(() => {
    setHydrated(false);

    if (pageLoad < 0) return;

    getSavedData(data => {
      console.log("getSavedData", data);
      setSavedData(data);
      setGotSavedData(true);
    });
  }, [connected, pageLoad]);

  return { mockIds, hydrated };
};

export { useHydrate };
