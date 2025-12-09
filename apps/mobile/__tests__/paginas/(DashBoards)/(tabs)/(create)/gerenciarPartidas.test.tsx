
const __rn = require("react-native");
__rn.Alert = __rn.Alert || { alert: jest.fn() };
jest.mock("@/constants/Theme", () => ({ useTheme: () => ({ isDarkMode: false }) }));
jest.mock("@/constants/Colors", () => ({
  Colors: { light: { background: "#fff" }, dark: { background: "#000" } },
}));

jest.mock("@/components/BackGroundComp", () => (props: any) => {
  const React = require("react");
  const { View } = require("react-native");
  return React.createElement(View, { testID: "bg" }, props.children);
});

jest.mock("@/components/EditMatchesCardComp", () => ({
  EditMatchesCard: (props: any) => {
    const React = require("react");
    const { View, Text, TouchableOpacity } = require("react-native");
    return React.createElement(
      View,
      { testID: `edit-card-${props.match?.id}` },
      React.createElement(Text, null, props.match?.title || ""),
      React.createElement(TouchableOpacity, { testID: `join-btn-${props.match?.id}`, onPress: props.onPressJoinMatch }, React.createElement(Text, null, "Jogadores")),
      React.createElement(TouchableOpacity, { testID: `infos-btn-${props.match?.id}`, onPress: props.onPressInfos }, React.createElement(Text, null, "Infos")),
      React.createElement(TouchableOpacity, { testID: `delete-btn-${props.match?.id}`, onPress: props.onPressDelete }, React.createElement(Text, null, "Delete"))
    );
  },
}));

jest.mock("@/components/HandleMatchComp", () => ({ HandleMatchComp: (props: any) => null }));
jest.mock("@/components/MatchEditModal", () => ({
  MatchEditModal: (props: any) => {
    const React = require("react");
    const { View, Text, TouchableOpacity } = require("react-native");
    return React.createElement(
      View,
      { testID: "match-edit-modal" },
      React.createElement(Text, null, "MatchEditMock"),
      React.createElement(
        TouchableOpacity,
        { testID: "match-save-success", onPress: () => props.onSave && props.onSave({ id: props.match?.id, title: "new" }) },
        React.createElement(Text, null, "SaveSuccess"),
      ),
      React.createElement(
        TouchableOpacity,
        {
          testID: "match-save-fail",
          onPress: () => props.onSave && props.onSave({ id: props.match?.id, MatchDate: "bad-date" }),
        },
        React.createElement(Text, null, "SaveFail"),
      ),
      React.createElement(
        TouchableOpacity,
        { testID: "match-save-rich", onPress: () => props.onSave && props.onSave({
          id: props.match?.id,
          title: "Titulo",
          description: "Desc",
          sport: "Futebol",
          maxPlayers: "12",
          teamNameA: "A",
          teamNameB: "B",
          location: "Loc",
          MatchDate: "2025-12-25T17:30:00Z",
          teamAScore: "2",
          teamBScore: "1",
        }) }, React.createElement(Text, null, "SaveRich")),
      React.createElement(
        TouchableOpacity,
        { testID: "match-save-generic", onPress: () => props.onSave && props.onSave({ id: props.match?.id, title: "will-fail" }) },
        React.createElement(Text, null, "SaveGeneric"),
      ),
      React.createElement(
        TouchableOpacity,
        { testID: "match-close", onPress: () => props.onClose && props.onClose() },
        React.createElement(Text, null, "Close"),
      ),
    );
  },
}));
jest.mock("@/components/MoreOptionsModalComp", () => (props: any) => null);
jest.mock("@/components/ReportReasonModal", () => (props: any) => null);
jest.mock("@/components/ModalDescription", () => ({ ModalDescription: (props: any) => null }));
jest.mock("@/components/PrimaryButton", () => (props: any) => {
  const React = require("react");
  const { Text, TouchableOpacity } = require("react-native");
  return React.createElement(TouchableOpacity, { onPress: props.onPress }, React.createElement(Text, null, props.children));
});
jest.mock("@/components/SecondaryButton", () => (props: any) => {
  const React = require("react");
  const { Text, TouchableOpacity } = require("react-native");
  return React.createElement(TouchableOpacity, { onPress: props.onPress }, React.createElement(Text, null, props.children));
});
jest.mock("@/components/AppText", () => (props: any) => {
  const React = require("react");
  const { Text } = require("react-native");
  return React.createElement(Text, null, props.children);
});

jest.mock("@react-navigation/native", () => ({ useFocusEffect: (cb: any) => cb() }));

jest.mock("@/libs/hooks/useEditMatchs", () => {
  const openModalConfirmCard = jest.fn();
  const useModal = jest.fn();
  return {
    UseModalEditMatchs: () => ({
      visibleConfirmCard: false,
      visible: false,
      visibleDetailsHandle: false,
      visibleInfosHandle: false,
      visibleReportMatch: false,
      visibleDescriptionMatch: false,
      selectedMatch: null,
      useModal,
      closeModal: jest.fn(),
      openDetailsHandleMatchModal: jest.fn(),
      closeDetailsHandleMatchModal: jest.fn(),
      openModalConfirmCard,
      closeModalConfirmCard: jest.fn(),
      openModalMoreInfosHandleModal: jest.fn(),
      closeModalMoreInfosHandleModal: jest.fn(),
      openReportMatchModal: jest.fn(),
      closeReportMatchModal: jest.fn(),
      openDetailsFromHandle: jest.fn(),
      openDescriptionMatchModal: jest.fn(),
      closeDescriptionMatchModal: jest.fn(),
    }),
    __openModalConfirmCard: openModalConfirmCard,
    __useModal: useModal,
  };
});

jest.mock("@/libs/hooks/useMyMatches", () => {
  const __reloadFeed = jest.fn();
  let state = {
    matches: [{ id: "m1", title: "Partida 1" }],
    isLoading: false,
    isRefreshing: false,
    onRefresh: jest.fn(),
    reloadFeed: __reloadFeed,
  };

  return {
    useMyMatches: () => state,
    __reloadFeed,
    __setMockMatchesState: (s: any) => {
      state = s;
    },
  };
});


jest.mock("@/libs/auth/handleMatch", () => {
  const __getMatchById = jest.fn().mockResolvedValue({ id: "m1", title: "Partida 1", players: [] });
  return { getMatchById: (...args: any[]) => __getMatchById(...args), __getMatchById };
});

jest.mock("@/libs/auth/handleMyMatches", () => ({ updateMatch: jest.fn(), deleteMatch: jest.fn() }));

jest.mock("@/libs/storage/UserContext", () => {
  let user = { id: "u1", token: "token-abc" };
  return {
    useUser: () => ({ user }),
    __setUser: (u: any) => { user = u; },
  };
});


import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
const GerenciarPartidas = require("@/app/(DashBoard)/(tabs)/(create)/gerenciarPartidas").default;

const editHook = require("@/libs/hooks/useEditMatchs");
const openModalConfirmCardMock = editHook.__openModalConfirmCard;
const matchModule = require("@/libs/auth/handleMatch");
const getMatchByIdMock = matchModule.__getMatchById;

describe("GerenciarPartidas page", () => {
  it("renders matches and opens confirm modal when join pressed", async () => {
    expect(GerenciarPartidas).toBeDefined();
    expect(typeof GerenciarPartidas).toBe("function");
    const BG = require("@/components/BackGroundComp");
    const EditCard = require("@/components/EditMatchesCardComp");
    const handleComp = require("@/components/HandleMatchComp");
    expect(BG).toBeDefined();
    expect(EditCard).toBeDefined();
    expect(handleComp).toBeDefined();

    const { getByTestId, getByText } = render(React.createElement(GerenciarPartidas));

    expect(getByText("Partida 1")).toBeTruthy();

    const joinBtn = getByTestId("join-btn-m1");
    fireEvent.press(joinBtn);

    await waitFor(() => {
      expect(getMatchByIdMock).toHaveBeenCalledWith("m1");
      expect(openModalConfirmCardMock).toHaveBeenCalled();
    });
  });

  it("calls useModal when infos pressed", async () => {
    const { getByTestId } = render(React.createElement(GerenciarPartidas));
    const infosBtn = getByTestId("infos-btn-m1");
    fireEvent.press(infosBtn);

    const editHookLocal = require("@/libs/hooks/useEditMatchs");
    expect(editHookLocal.__useModal).toHaveBeenCalledWith({ id: "m1", title: "Partida 1" });
  });

  it("shows delete modal and calls deleteMatch on confirm", async () => {
    const { getByTestId, getByText } = render(React.createElement(GerenciarPartidas));

    const delBtn = getByTestId("delete-btn-m1");
    fireEvent.press(delBtn);

    const apagarBtn = getByText("Apagar");

    const mods = require("@/libs/auth/handleMyMatches");
    mods.deleteMatch.mockResolvedValueOnce({});

    const myMatches = require("@/libs/hooks/useMyMatches");
    const reload = myMatches.__reloadFeed;

    fireEvent.press(apagarBtn);

    await waitFor(() => {
      expect(mods.deleteMatch).toHaveBeenCalledWith("m1", "token-abc");
      expect(reload).toHaveBeenCalled();
    });
  });

  it("calls updateMatch and reloads on save success, does not reload on save failure", async () => {
    const { getByTestId } = render(React.createElement(GerenciarPartidas));

    const mods = require("@/libs/auth/handleMyMatches");
    const myMatches = require("@/libs/hooks/useMyMatches");
    const reload = myMatches.__reloadFeed;

    const initialCalls = reload.mock ? reload.mock.calls.length : 0;

    mods.updateMatch.mockResolvedValueOnce({});
    const saveBtn = getByTestId("match-save-success");
    fireEvent.press(saveBtn);

    await waitFor(() => {
      expect(mods.updateMatch).toHaveBeenCalled();
      expect(reload.mock.calls.length).toBe(initialCalls + 1);
    });

    mods.updateMatch.mockRejectedValueOnce({ response: { data: { message: "Erro na DATA" } } });
    const saveFailBtn = getByTestId("match-save-fail");
    fireEvent.press(saveFailBtn);

    await waitFor(() => {
      expect(reload.mock.calls.length).toBe(initialCalls + 1);
    });
  });

  it("handles rich save payload and calls updateMatch with normalized data", async () => {
    const { getByTestId } = render(React.createElement(GerenciarPartidas));

    const mods = require("@/libs/auth/handleMyMatches");
    const myMatches = require("@/libs/hooks/useMyMatches");
    const reload = myMatches.__reloadFeed;

    mods.updateMatch.mockResolvedValueOnce({});

    const saveRich = getByTestId("match-save-rich");
    fireEvent.press(saveRich);

    await waitFor(() => {
      expect(mods.updateMatch).toHaveBeenCalled();
      const [[, dataSent]] = mods.updateMatch.mock.calls.slice(-1);
      expect(dataSent.title).toBe("Titulo");
      expect(typeof dataSent.maxPlayers).toBe("number");
      expect(dataSent.teamAScore).toBe(2);
      expect(reload).toHaveBeenCalled();
    });
  });

  it("handles updateMatch response.message general error", async () => {
    const { getByTestId } = render(React.createElement(GerenciarPartidas));
    const mods = require("@/libs/auth/handleMyMatches");
    const myMatches = require("@/libs/hooks/useMyMatches");
    const reload = myMatches.__reloadFeed;

    const initialCalls = reload.mock ? reload.mock.calls.length : 0;

    mods.updateMatch.mockRejectedValueOnce({ response: { data: { message: "Outro erro" } } });
    const saveFailBtn = getByTestId("match-save-fail");
    fireEvent.press(saveFailBtn);

    await waitFor(() => {
      expect(mods.updateMatch).toHaveBeenCalled();
      expect(reload.mock.calls.length).toBe(initialCalls);
    });
  });

  it("handles updateMatch rejection with Error containing 'date'", async () => {
    const { getByTestId } = render(React.createElement(GerenciarPartidas));
    const mods = require("@/libs/auth/handleMyMatches");
    const myMatches = require("@/libs/hooks/useMyMatches");
    const reload = myMatches.__reloadFeed;

    const initialCalls = reload.mock ? reload.mock.calls.length : 0;

    mods.updateMatch.mockRejectedValueOnce(new Error("Invalid date format"));
    const saveFailBtn = getByTestId("match-save-fail");
    fireEvent.press(saveFailBtn);

    await waitFor(() => {
      expect(mods.updateMatch).toHaveBeenCalled();
      expect(reload.mock.calls.length).toBe(initialCalls);
    });
  });

  it("alerts when getMatchById fails", async () => {
    const { getByTestId } = render(React.createElement(GerenciarPartidas));
    const matchModuleLocal = require("@/libs/auth/handleMatch");
    matchModuleLocal.__getMatchById.mockRejectedValueOnce(new Error("nope"));

    const joinBtn = getByTestId("join-btn-m1");
    fireEvent.press(joinBtn);

    await waitFor(() => {
      expect(matchModuleLocal.__getMatchById).toHaveBeenCalledWith("m1");
    });
  });

  it("alerts when deleting without authentication and when deleteMatch fails", async () => {
    const userMock = require("@/libs/storage/UserContext");
    userMock.__setUser(null);

    const { getByTestId, getByText } = render(React.createElement(GerenciarPartidas));
    const delBtn = getByTestId("delete-btn-m1");

    const modsHandle = require("@/libs/auth/handleMyMatches");
    modsHandle.deleteMatch = jest.fn();

    fireEvent.press(delBtn);

    const apagarBtn = getByText("Apagar");
    fireEvent.press(apagarBtn);

    await waitFor(() => {
      expect(modsHandle.deleteMatch).not.toHaveBeenCalled();
    });

    userMock.__setUser({ id: "u1", token: "token-abc" });

    const myMatchesForAuth = require("@/libs/hooks/useMyMatches");
    myMatchesForAuth.__reloadFeed = jest.fn();

    const mods = require("@/libs/auth/handleMyMatches");
    mods.deleteMatch = jest.fn().mockRejectedValueOnce(new Error("boom"));

    fireEvent.press(delBtn);
    const apagarBtn2 = getByText("Apagar");
    fireEvent.press(apagarBtn2);

    await waitFor(() => {
      expect(mods.deleteMatch).toHaveBeenCalled();
      const myMatches = require("@/libs/hooks/useMyMatches");
      const currentCalls = myMatches.__reloadFeed.mock ? myMatches.__reloadFeed.mock.calls.length : 0;
      expect(currentCalls).toBe(0);
    });
  });

  it("handles generic save error and does not reload", async () => {
    const { getByTestId } = render(React.createElement(GerenciarPartidas));

    const mods = require("@/libs/auth/handleMyMatches");
    const myMatches = require("@/libs/hooks/useMyMatches");
    const reload = myMatches.__reloadFeed;

    const initialCalls = reload.mock ? reload.mock.calls.length : 0;

    mods.updateMatch.mockRejectedValueOnce(new Error("network failure"));

    const saveGenericBtn = getByTestId("match-save-generic");
    fireEvent.press(saveGenericBtn);

    await waitFor(() => {
      expect(mods.updateMatch).toHaveBeenCalled();
      expect(reload.mock.calls.length).toBe(initialCalls);
    });
  });

  it("shows ActivityIndicator when loading and no matches", () => {
    const myMatchesMock = require("@/libs/hooks/useMyMatches");
    myMatchesMock.__setMockMatchesState({ matches: [], isLoading: true, isRefreshing: false, onRefresh: jest.fn(), reloadFeed: myMatchesMock.__reloadFeed });

    const G = require("@/app/(DashBoard)/(tabs)/(create)/gerenciarPartidas").default;
    const { ActivityIndicator } = require("react-native");

    const { toJSON } = render(React.createElement(G));

    const tree = toJSON();
    const found = (function find(node: any): boolean {
      if (!node) return false;
      if (Array.isArray(node)) return node.some(find);
      if (node.type === "ActivityIndicator") return true;
      if (node.children && node.children.length) return node.children.some(find);
      return false;
    })(tree);

    expect(found).toBeTruthy();
  });
});
