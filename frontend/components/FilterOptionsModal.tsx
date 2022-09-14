import CustomButton from "./CustomButton";
import React from "react";
import {Filters} from "../entities/Filters";

export const FilterOptionsModalId = "filter-options-modal";

type FilterOptionsModalProps = {
  filters: Filters,
  setFilters: (filters: Filters) => void
}

const FilterOptionsModal = (props: FilterOptionsModalProps) => {
  return (
    <div className="text-white">
      <input type="checkbox" id={FilterOptionsModalId} className="modal-toggle"/>
      <div className="modal modal-bottom sm:modal-middle">
        <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Show hidden items</span>
              <input type="checkbox" checked={props.filters.display_hidden} className="checkbox checkbox-primary"
                     onChange={(e) => props.setFilters({...props.filters, display_hidden: e.target.checked})}/>
            </label>
          </div>
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Show viewed items</span>
              <input type="checkbox" checked={props.filters.display_viewed} className="checkbox checkbox-primary"
                     onChange={(e) => props.setFilters({...props.filters, display_viewed: e.target.checked})}/>
            </label>
          </div>
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Show recommended items</span>
              <input type="checkbox" checked={props.filters.display_recommended} className="checkbox checkbox-primary"
                     onChange={(e) => props.setFilters({...props.filters, display_recommended: e.target.checked})}/>
            </label>
          </div>
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Show discouraged items</span>
              <input type="checkbox" checked={props.filters.display_discouraged} className="checkbox checkbox-primary"
                     onChange={(e) => props.setFilters({...props.filters, display_discouraged: e.target.checked})}/>
            </label>
          </div>
          <div className="modal-box">
            <div className="modal-action">
              <CustomButton text={"Close"} icon={undefined} relatedModalId={FilterOptionsModalId}
                            clickAction={() => {
                            }}/>
            </div>
          </div>
        </ul>
      </div>
    </div>
  )
}

export default FilterOptionsModal;