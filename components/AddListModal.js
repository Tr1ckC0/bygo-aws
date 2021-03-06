import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";

// GraphQL
import { API, graphqlOperation } from "aws-amplify";
import { createList } from "../src/graphql/mutations";

// Recoil
import { listsState } from "../atoms/listsState";
import { currentUserState } from "../atoms/currentUserState";
import { useRecoilState, useRecoilValue } from "recoil";

// EXPO
import { BlurView } from "expo-blur";
import { Feather } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";

// helpers
import pickColor from "../services/colorRandomizer";
import themes from "../services/themes"



const AddListModal = ({ closeModal }) => {
  const [title, setTitle] = useState("");
  const currentUser = useRecoilValue(currentUserState);
  const [lists, setLists] = useRecoilState(listsState);

  useEffect(() => {
    return () => {
      setTitle("");
    }
  }, [])

  async function addList() {
    try {
      const data = await API.graphql(
        graphqlOperation(createList, {
          input: { title, userID: currentUser.id },
        })
      );
      const newList = {
        id: data.data.createList.id,
        title: data.data.createList.title,
        userID: data.data.createList.user.id,
        items: {
          items: []
        },
        color: pickColor()
      };
      setLists((prev) => [...prev, newList]);
    } catch (err) {
      console.log("error creating user:", err);
    }
  }

  return (
    <BlurView intensity={70} style={styles.modalContainer}>
      <View style={styles.modal}>
        <TouchableOpacity style={styles.cancel} onPress={closeModal}>
          <Feather name="x" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.header}>New List</Text>
        <TextInput
          style={styles.input}
          onChangeText={(val) => setTitle(val)}
          defaultValue={title}
          placeholder="Enter your list title"
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            addList();
            closeModal();
          }}
        >
          <AntDesign name="plus" size={24} color="white" />
          <Text style={styles.buttonText}>Add List</Text>
        </TouchableOpacity>
      </View>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    position: "absolute",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    width: "100%",
  },
  modal: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    height: "40%",
    width: "80%",
    marginBottom: 100,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    borderRadius: 10,
  },
  header: {
    textAlign: "center",
    color: "white",
    fontSize: 24,
    fontFamily: `${themes.navFont}`,
    marginTop: 10,
    marginBottom: 15
  },
  input: {
    backgroundColor: "white",
    width: "80%",
    padding: 20,
    fontSize: 20,
    borderRadius: 10,
  },
  cancel: {
    position: "absolute",
    left: 10,
    top: 10,
  },
  addButton: {
    display: "flex",
    flexDirection: "row",
    backgroundColor: "#25db37",
    width: "60%",
    margin: 20,
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: "white",
    fontFamily: `${themes.addFont}`,
    fontSize: 20,
    marginLeft: 10,
  },
});

export default AddListModal;
