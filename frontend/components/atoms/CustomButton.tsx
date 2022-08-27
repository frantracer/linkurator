import React from "react";

export enum IconForButton {
  add = 'add',
  download = 'download',
  favorite = 'favorite',
  trash = 'trash',
  pencil = 'pencil'
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
    case IconForButton.trash:
      svgComponent = <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5"
                          stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round"
              d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/>
      </svg>
      break;
    case IconForButton.pencil:
      svgComponent =
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"
             className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round"
                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"/>
        </svg>
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
