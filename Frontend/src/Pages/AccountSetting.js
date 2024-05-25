import React, { useEffect } from "react"
import Header from "../Components/Header"
import BreadsCrumbs from "../Components/BreadCrumbs"
import Navigation from "../Components/Navigation"
import Setting from "../Components/setting"
import Footer from "../Components/Footer"

function AccountSetting() {
    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth' // This makes the scrolling smooth
        });
    }, [])
    return (
        <React.Fragment>
            <div className="relative min-h-screen bg-white">
                
                <Header />
                <main className="relative z-10 flex items-center justify-center my-4 md:mt-10 md:mb-24">
                    <div className="w-[95%] md:w-[90%]">
                        <BreadsCrumbs />
                        <section className="flex md:flex-row flex-col justify-between md:mt-[20px]">
                            <Navigation active={"Setting"} />
                            <Setting />
                        </section>
                    </div>
                </main>
                <Footer />
            </div>
        </React.Fragment>
    )
}
export default AccountSetting