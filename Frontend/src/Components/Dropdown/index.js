import { Fragment, useState } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function Dropdown({ width, activeItem, setActiveItem, Array,classname }) {
    const [isOpen, setIsOpen] = useState(false); // State to manage dropdown open/close

    // Function to handle click on menu item and update activeItem state
    const handleItemClick = (item) => {
        setActiveItem(item);
        setIsOpen(false); // Close dropdown after selecting item
    };

    return (
        <Menu as="div" className=" relative inline-block text-left">
            <div style={{height:"49px" ,width: width || "100%" }}>
                <Menu.Button
                    className="h-[49px] inline-flex w-full items-center justify-between text-[#1d1d1f] gap-x-1.5 rounded-xl bg-white px-3 py-2 text-sm font-medium border border-[#d2d2d7] hover:border-[#f97316] transition-colors duration-200"
                    onClick={() => setIsOpen(!isOpen)} // Toggle dropdown open/close
                >
                    {activeItem || "Select"}
                    <ChevronDownIcon className="-mr-1 h-5 w-5 text-[#86868b]" aria-hidden="true" />
                </Menu.Button>
            </div>

            <Transition
                show={isOpen} // Show/hide transition based on isOpen state
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items className="overflow-y-scroll h-[250px] absolute right-0 z-50 mt-2 w-full origin-top-right rounded-xl bg-white shadow-lg border border-[#d2d2d7] focus:outline-none">
                    {Array?.map((A) => (
                        <div className="py-1">
                            <Menu.Item>
                                <p
                                    className={classNames(
                                        activeItem === A ? 'bg-[#f5f5f7] text-[#1d1d1f]' : 'text-[#1d1d1f]',
                                        'block px-4 py-2 text-sm cursor-pointer hover:bg-[#f5f5f7]'
                                    )}
                                    onClick={() => handleItemClick(A)}
                                >
                                    {A}
                                </p>
                            </Menu.Item>
                        </div>
                    ))}
                </Menu.Items>
            </Transition>
        </Menu>
    )
}
