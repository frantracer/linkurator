import CustomButton from "./CustomButton";
import React, {useEffect, useState} from "react";
import {Filters} from "../entities/Filters";
import {scrollToDrawerTop} from "../utilities/scrollToDrawerTop";

export const FilterOptionsModalId = "filter-options-modal";

type FilterOptionsModalProps = {
  filters: Filters,
  setFilters: (filters: Filters) => void
}

const FilterOptionsModal = (props: FilterOptionsModalProps) => {
  const [tempFilters, setTempFilters] = useState<Filters>(props.filters);

  useEffect(() => {
    setTempFilters(props.filters)
  }, [props.filters])

  return (
    <div className="text-white">
      <input type="checkbox" id={FilterOptionsModalId} className="modal-toggle"/>
      <div className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-lg m-2">Filter options</h3>
          <div className="form-control">
            <label className="label">
              <input type="text" placeholder="Search..." defaultValue={tempFilters.textSearch}
                     className="input input-primary input-bordered min-w-full max-w-full"
                     value={tempFilters.textSearch}
                     onChange={(e) => setTempFilters({...tempFilters, textSearch: e.target.value})}/>
            </label>
          </div>
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Show hidden items</span>
              <input type="checkbox" checked={tempFilters.display_hidden} className="checkbox checkbox-primary"
                     onClick={() => setTempFilters({...tempFilters, display_hidden: !tempFilters.display_hidden})}/>
            </label>
          </div>
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Show viewed items</span>
              <input type="checkbox" checked={tempFilters.display_viewed} className="checkbox checkbox-primary"
                     onClick={() => setTempFilters({...tempFilters, display_viewed: !tempFilters.display_viewed})}/>
            </label>
          </div>
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Show recommended items</span>
              <input type="checkbox" checked={tempFilters.display_recommended}
                     className="checkbox checkbox-primary"
                     onClick={() => setTempFilters({
                       ...tempFilters,
                       display_recommended: !tempFilters.display_recommended
                     })}/>
            </label>
          </div>
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Show discouraged items</span>
              <input type="checkbox" checked={tempFilters.display_discouraged}
                     className="checkbox checkbox-primary"
                     onClick={() => setTempFilters({
                       ...tempFilters,
                       display_discouraged: !tempFilters.display_discouraged
                     })}/>
            </label>
          </div>
          <div className="modal-action">
            <form method="dialog">
              <label htmlFor={FilterOptionsModalId}
                     className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</label>
              <CustomButton text={"Accept"} icon={undefined} relatedModalId={FilterOptionsModalId}
                            clickAction={() => {
                              props.setFilters(tempFilters)
                              scrollToDrawerTop()
                            }}/>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FilterOptionsModal;
