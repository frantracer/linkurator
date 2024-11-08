import {NewTopicModalId} from "./NewTopicModal";
import React from "react";
import {AddIcon} from "../atoms/Icons";
import Button from "../atoms/Button";
import {openModal} from "../../utilities/modalAction";
import Divider from "../atoms/Divider";
import {NewSubscriptionModalId} from "./NewSubscriptionModal";
import FlexColumn from "../atoms/FlexColumn";

const CreateFirstTopicHero = () => {
  return (
    <div className="hero min-h-screen bg-base-100">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <FlexColumn position={"center"}>
            <p className="text-5xl font-bold">¡Encuentra el contenido!</p>
            <p className="py-2">Sigue las subscripciones que desees categorizar o en las que buscar</p>
            <Button clickAction={() => openModal(NewSubscriptionModalId)}>
              <AddIcon/>
              <span>Seguir subscripción</span>
            </Button>
            <Divider text={"Y"}/>
            <p className="text-5xl font-bold">¡Crea tu primera categoría!</p>
            <p className="py-2">Elige algunas de tus subscripciones y agrúpalas en una categoría</p>
            <Button clickAction={() => openModal(NewTopicModalId)}>
              <AddIcon/>
              <span>Nueva categoría</span>
            </Button>
          </FlexColumn>
        </div>
      </div>
    </div>
  );
}

export default CreateFirstTopicHero;
