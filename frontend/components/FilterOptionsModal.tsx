import CustomButton from "./CustomButton";
import React, {useState} from "react";
import {Filters} from "../entities/Filters";

export const FilterOptionsModalId = "filter-options-modal";

type FilterOptionsModalProps = {
  filters: Filters,
  setFilters: (filters: Filters) => void
}

const FilterOptionsModal = (props: FilterOptionsModalProps) => {
  const [tempFilters, setTempFilters] = useState<Filters>(props.filters);

  console.log(tempFilters)

  return (
    <div className="text-white">
      <input type="checkbox" id={FilterOptionsModalId} className="modal-toggle"/>
      <div className="modal modal-bottom sm:modal-middle">
        <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-fit">
          <div className="form-control">
            <label className="label">
              <input type="text" placeholder="Search..." className="input input-primary input-bordered"
                     value={tempFilters.textSearch}
                     onChange={(e) => setTempFilters({...tempFilters, textSearch: e.target.value})}/>
            </label>
          </div>
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Show hidden items</span>
              <input type="checkbox" defaultChecked={tempFilters.display_hidden} className="checkbox checkbox-primary"
                     onClick={() => setTempFilters({...tempFilters, display_hidden: !tempFilters.display_hidden})}/>
            </label>
          </div>
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Show viewed items</span>
              <input type="checkbox" defaultChecked={tempFilters.display_viewed} className="checkbox checkbox-primary"
                     onClick={() => setTempFilters({...tempFilters, display_viewed: !tempFilters.display_viewed})}/>
            </label>
          </div>
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Show recommended items</span>
              <input type="checkbox" defaultChecked={tempFilters.display_recommended} className="checkbox checkbox-primary"
                     onClick={() => setTempFilters({...tempFilters, display_recommended: !tempFilters.display_recommended})}/>
            </label>
          </div>
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Show discouraged items</span>
              <input type="checkbox" defaultChecked={tempFilters.display_discouraged} className="checkbox checkbox-primary"
                     onClick={() => setTempFilters({...tempFilters, display_discouraged: !tempFilters.display_discouraged})}/>
            </label>
          </div>
          <div className="modal-box">
            <div className="modal-action">
              <CustomButton text={"Accept"} icon={undefined} relatedModalId={FilterOptionsModalId}
                            clickAction={() => {
                              props.setFilters(tempFilters)
                            }}/>
            </div>
          </div>
        </ul>
      </div>
    </div>
  )
}

export default FilterOptionsModal;
