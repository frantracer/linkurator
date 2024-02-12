import CustomButton from "../atoms/CustomButton";
import React, {useEffect, useState} from "react";
import {Filters} from "../../entities/Filters";
import {scrollToDrawerTop} from "../../utilities/scrollToDrawerTop";

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

      <dialog className="modal modal-bottom sm:modal-middle">

        <div className="modal-box min-w-full sm:min-w-fit">
          <h3 className="font-bold text-lg">Filter options</h3>

          <div className="form-control">
            <span className="label-text">Text filter</span>
            <label className="label">
              <input type="text" placeholder="Search..." defaultValue={tempFilters.textSearch}
                     className="input input-primary input-bordered w-full"
                     onChange={(e) => setTempFilters({...tempFilters, textSearch: e.target.value})}/>
            </label>
          </div>

          <div className="flex justify-between">
            <div className="form-control">
              <span className="label-text">Min seconds</span>
              <label className="label">
                <input type="number" placeholder="" defaultValue={tempFilters.minDuration || 0}
                       className="input input-primary input-bordered w-32"
                       onChange={(e) => setTempFilters({...tempFilters, minDuration: Number(e.target.value)})}/>
              </label>
            </div>
            <div className="form-control">
              <span className="label-text">Max seconds</span>
              <label className="label">
                <input type="number" placeholder="" defaultValue={tempFilters.maxDuration || 100000}
                       className="input input-primary input-bordered w-32"
                       onChange={(e) => setTempFilters({...tempFilters, maxDuration: Number(e.target.value)})}/>
              </label>
            </div>
          </div>

          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Show hidden items</span>
              <input type="checkbox" defaultChecked={tempFilters.displayHidden} className="checkbox checkbox-primary"
                     onClick={() => setTempFilters({...tempFilters, displayHidden: !tempFilters.displayHidden})}/>
            </label>
          </div>

          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Show viewed items</span>
              <input type="checkbox" defaultChecked={tempFilters.displayViewed} className="checkbox checkbox-primary"
                     onClick={() => setTempFilters({...tempFilters, displayViewed: !tempFilters.displayViewed})}/>
            </label>
          </div>

          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Show recommended items</span>
              <input type="checkbox" defaultChecked={tempFilters.displayRecommended}
                     className="checkbox checkbox-primary"
                     onClick={() => setTempFilters({
                       ...tempFilters,
                       displayRecommended: !tempFilters.displayRecommended
                     })}/>
            </label>
          </div>

          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Show discouraged items</span>
              <input type="checkbox" defaultChecked={tempFilters.displayDiscouraged}
                     className="checkbox checkbox-primary"
                     onClick={() => setTempFilters({
                       ...tempFilters,
                       displayDiscouraged: !tempFilters.displayDiscouraged
                     })}/>
            </label>
          </div>

          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Show all other items</span>
              <input type="checkbox" defaultChecked={tempFilters.displayWithoutInteraction}
                     className="checkbox checkbox-primary"
                     onClick={() => setTempFilters({
                       ...tempFilters,
                       displayWithoutInteraction: !tempFilters.displayWithoutInteraction
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
      </dialog>
    </div>
  )
}

export default FilterOptionsModal;
