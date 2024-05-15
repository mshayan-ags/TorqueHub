import BreadsCrumbs from "../BreadCrumbs"
import BreadBg from "../../assets/BreadcrumbBg.svg"
function BreadCrumbContainer() {
    return (
        <div className="flex item-center justify-center w-full h-[84px] " style={{ backgroundImage: `url(${BreadBg})`, backgroundRepeat: "no-repeat" }}>
            <div className="flex w-[80%] ">
                <div class="flex" aria-label="Breadcrumb">
                    <ol class="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
                        <li class="inline-flex items-center">
                            <a href="#" class="inline-flex items-center text-[14px] font-[400] font-actorPro   text-[#ffffff] ">

                                Home
                            </a>
                        </li>
                        <li>
                            <div class="flex items-center">
                                <svg class="rtl:rotate-180 w-2 h-2 text-[#ffffff] mx-1 font-actorPro" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 9 4-4-4-4" />
                                </svg>
                                <a href="#" class="ms-1 text-[14px] font-[400]   font-actorPro text-[#ffffff]">Shop</a>
                            </div>
                        </li>
                        <li aria-current="page">
                            <div class="flex items-center">
                                <svg class="rtl:rotate-180 w-2 h-2 text-[#ffffff] mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 9 4-4-4-4" />
                                </svg>
                                <span class="ms-1 text-[14px] font-[400]   md:ms-2 font-actorPro text-[#ffffff]">Your Cart</span>
                            </div>
                        </li>
                        <li aria-current="page">
                            <div class="flex items-center">
                                <svg class="rtl:rotate-180 w-2 h-2 text-[#ffffff] mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 9 4-4-4-4" />
                                </svg>
                                <span class="ms-1 text-[14px] font-[400]   md:ms-2 font-actorPro text-[#ffffff]">Checkout</span>
                            </div>
                        </li>
                    </ol>
                </div>
            </div>
        </div>
    )
}
export default BreadCrumbContainer