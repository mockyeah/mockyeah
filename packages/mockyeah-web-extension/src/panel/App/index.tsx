import React, { useEffect, useState, useCallback } from "react";
import { Tabs, Tab, TabList, TabPanel } from "react-tabs";
import {
  inspectEval,
  sendDevToolsHasLoadedMocks,
  unmock,
  saveMock,
  saveMocks,
  getMocks,
  getConnected
} from "../../api";
import { TabNetwork } from "../TabNetwork";
import { TabMocks } from "../TabMocks";
import { EditMockModal } from "../EditMockModal";
import { useHydrate } from "../hooks/useHydrate";
// @ts-ignore
import logo from "../../icon-128.png";

const App = () => {
  const [connectErrored, setConnectErrored] = useState(false);
  const [connected, setConnected] = useState(false);
  const [pageLoad, setPageLoad] = useState(-1);
  const [mocks, setMocks] = useState();
  const [editingMockId, setEditingMockId] = useState<string>();
  const [editingMockInit, setEditingMockInit] = useState();
  const [managedMockIds, setManagedMockIds] = useState<string[]>([]);
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [devToolsHasLoadedMocks, setDevToolsHasLoadedMocks] = useState(false);

  const { mockIds: _managedMockIds, hydrated } = useHydrate({
    connected,
    pageLoad
  });

  useEffect(() => {
    if (!connected) return;
    if (!hydrated) return;
    setManagedMockIds(_managedMockIds);
    setDevToolsHasLoadedMocks(true);
    sendDevToolsHasLoadedMocks();
  }, [_managedMockIds, connected, hydrated]);

  const getMocksReact = useCallback(() => {
    if (!connected) return;
    if (!hydrated) return;

    getMocks(({ result }) => {
      if (result) {
        const newMocks = result.filter(mock =>
          managedMockIds.includes(mock[0].$meta?.id)
        );
        setMocks(newMocks);
      }
    });
  }, [hydrated, connected, setMocks, managedMockIds]);

  const editMock = useCallback(
    (id, init) => {
      setEditingMockId(id);
      setEditingMockInit(init);
    },
    [setEditingMockId, setEditingMockInit]
  );

  const closeEditMock = useCallback(() => {
    setEditingMockId(undefined);
    setEditingMockInit(undefined);
  }, [setEditingMockId, setEditingMockInit]);

  const unmockReact = useCallback(
    (id, callback) => {
      unmock(id, ({ result }) => {
        if (result) {
          setManagedMockIds(managedMockIds.filter(eid => eid !== id));
        }
        if (callback) callback({ result });
      });
    },
    [getMocksReact, managedMockIds, setManagedMockIds]
  );

  const saveMockReact = useCallback(
    (id, init, callback, { dontFocusMocksTab = false } = {}) => {
      saveMock(id, init, ({ result }) => {
        const { id: newId, removedIds } = result;
        const newManagedMockIds = [
          ...(managedMockIds || []).filter(
            eid => eid !== id && !removedIds.includes(id)
          ),
          newId
        ];
        setManagedMockIds(newManagedMockIds);
        closeEditMock();
        if (!dontFocusMocksTab) setSelectedTabIndex(0);
        if (callback) callback({ result });
      });
    },
    [closeEditMock, setManagedMockIds, managedMockIds]
  );

  // const onClickClear = useCallback(() => {
  //     chrome.storage.local.clear(() => {
  //         getSavedData(() => {
  //             getMocksReact();
  //         });
  //     });
  // }, [getMocksReact]);

  const getConnectedReact = useCallback(() => {
    getConnected(({ result, exceptionInfo }) => {
      if (exceptionInfo) {
        setConnectErrored(true);
        setConnected(false);
      } else {
        setConnectErrored(false);
        setConnected(result);
      }
    });
  }, [setConnected, setConnectErrored]);

  const onPageLoad = () => {
    inspectEval(`
          window.__MOCKYEAH_DEVTOOLS_EXTENSION__ = {};
        `);

    setConnected(false);
    setConnectErrored(false);
    setDevToolsHasLoadedMocks(false);
    setManagedMockIds([]);
    setMocks(undefined);
    setEditingMockId(undefined);
    setEditingMockInit(undefined);

    setPageLoad(pageLoad + 1);

    getConnectedReact();
  };

  useEffect(() => {
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (tabId === chrome.devtools.inspectedWindow.tabId) {
        if (changeInfo.status === "complete") {
          onPageLoad();
        }
      }
    });

    onPageLoad();
  }, []);

  useEffect(() => {
    if (!connected) return;
    if (!hydrated) return;

    getMocksReact();
  }, [hydrated, connected, managedMockIds]);

  useEffect(() => {
    if (!devToolsHasLoadedMocks) return;
    if (!mocks) return;

    saveMocks(mocks);
  }, [mocks, devToolsHasLoadedMocks]);

  useEffect(() => {
    if (!mocks) return;

    const mock = mocks.find(mock => mock[0]?.$meta?.id === editingMockId);

    if (mock) {
      const [match, response] = mock || [];

      setEditingMockInit({
        match: {
          method: match?.$meta?.originalSerialized?.method,
          url: match?.$meta?.originalSerialized?.url
        },
        response: {
          raw: response?.raw,
          json: response?.json,
          text: response?.text
        }
      });
    }
  }, [mocks, editingMockId]);

  const onSelectTab = useCallback(
    index => {
      setSelectedTabIndex(index);
    },
    [setSelectedTabIndex]
  );

  return (
    <div style={{ margin: 8 }}>
      <header style={{ display: "flex", alignItems: "center" }}>
        <img src={logo} height={30} />
        &nbsp;
        <h1>mockyeah</h1>
      </header>
      <div>
        {/* <button onClick={onClickClear}>clear</button> */}

        <Tabs selectedIndex={selectedTabIndex} onSelect={onSelectTab}>
          <TabList>
            <Tab>Mocks</Tab>
            <Tab>Network</Tab>
          </TabList>

          <TabPanel>
            <TabMocks
              connected={connected}
              connectErrored={connectErrored}
              mocks={mocks}
              managedMockIds={managedMockIds}
              unmock={unmockReact}
              editMock={editMock}
            />
          </TabPanel>

          <TabPanel>
            <TabNetwork editMock={editMock} />
          </TabPanel>
        </Tabs>
      </div>
      {editingMockInit && (
        <EditMockModal
          id={editingMockId}
          init={editingMockInit}
          saveMock={saveMockReact}
          close={closeEditMock}
        />
      )}
    </div>
  );
};

App.displayName = "App";

export { App };
