import React, { useEffect } from "react";
import Header from "../Components/Header";
import BreadsCrumbs from "../Components/BreadCrumbs";
import Navigation from "../Components/Navigation";
import Setting from "../Components/setting";
import Footer from "../Components/Footer";
import Table from "../Components/Table";
import { withProductContext } from "../context/Product";

function OrderHistory() {
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
        <main className="relative z-10 flex items-center justify-center mt-10 mb-24">
          <div className="w-[90%]">
            <BreadsCrumbs />
            <section className="flex md:flex-row flex-col gap-10 justify-between mt-[20px]">
              <Navigation active={"OrderHistory"} />
              <section className="md:w-[78%] w-[100%]">
                <Table />
              </section>
            </section>
          </div>
        </main>
        <Footer />
      </div>
    </React.Fragment>
  );
}
export default (OrderHistory);
