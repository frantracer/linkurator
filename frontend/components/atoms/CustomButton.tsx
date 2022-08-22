import React from "react";

export enum IconForButton {
  add = 'add',
  download = 'download',
  favorite = 'favorite'
}

type CustomButton = {
  text: string
  icon: IconForButton | undefined,
  relatedModalId: string | undefined
  clickAction: () => void
}

const CustomButton = (props: CustomButton) => {
  let svgComponent = undefined;
  switch (props.icon) {
    case IconForButton.download:
      svgComponent =
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"
             className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round"
                d="M9 12.75l3 3m0 0l3-3m-3 3v-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      break;
    case IconForButton.add:
      svgComponent =
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"
             className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m7-7H5"/>
        </svg>
      break;
    case IconForButton.favorite:
      svgComponent = <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24"
                          stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d={"M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"}/>
      </svg>;
      break;
  }

  return (props.relatedModalId ?
      <label onClick={props.clickAction} htmlFor={props.relatedModalId}
             className="btn btn-primary modal-button gap-2 m-4">
        {svgComponent}
        {props.text}
      </label>
      :
      <button onClick={props.clickAction}
              className="btn btn-primary gap-2 m-4">
        {svgComponent}
        {props.text}
      </button>
  );
}

export default CustomButton;
