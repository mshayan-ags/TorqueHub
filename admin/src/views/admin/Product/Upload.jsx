import { MdFileUpload } from "react-icons/md";
import Card from "components/card";
import React, { useState } from "react";

const Upload = ({ onImageSelected, preview, disabled }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        setSelectedImage(e.target.result);
        onImageSelected({
          data: e.target.result,
          name: file.name,
          type: file.type,
        });
      };

      reader.readAsDataURL(file);
    }
  };

  return (
    <Card className="grid h-full w-full grid-cols-1 gap-3 rounded-[20px] bg-white bg-clip-border p-3 font-dm shadow-3xl shadow-shadow-500 dark:!bg-navy-800 dark:shadow-none 2xl:grid-cols-11">
      <div className="col-span-12 h-full w-full rounded-xl bg-lightPrimary dark:!bg-navy-700 2xl:col-span-6">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="image-picker-input"
          id="image-picker"
          style={{ display: "none" }}
          disabled={disabled}
        />
        <label htmlFor="image-picker" className="image-picker-label flex h-full w-full flex-col items-center justify-center rounded-xl border-[2px] border-dashed border-gray-200 py-3 dark:!border-navy-700 lg:pb-0">
          <div>
            <MdFileUpload className="text-[80px] text-brand-500 dark:text-white" />
            <h4 className="text-xl font-bold text-brand-500 dark:text-white">
              Upload Files
            </h4>
            <p className="mt-2 text-sm font-medium text-gray-600">
              PNG, JPG and GIF files are allowed
            </p>
          </div>
        </label>
      </div>

      <div className="col-span-5 flex h-full w-full flex-col justify-center overflow-hidden rounded-xl bg-white pl-3 pb-4 dark:!bg-navy-800">
        {preview?.length ?
          <div class="grid grid-cols-4 gap-4 my-10 bg-white rounded-[50px] py-20 px-10">
            {
              preview.map((a) => {
                return <img
                  src={a}
                  alt="Selected"
                  className="selected-image"
                  style={{ width: "150px", height: "150px", borderRadius: "25%" }}
                />
              })}
          </div> :
          <>
            <h5 className="text-left text-xl font-bold leading-9 text-navy-700 dark:text-white">
              Complete Your Product
            </h5>
            <p className="leading-1 mt-2 text-base font-normal text-gray-600">
              Stay on the pulse of distributed projects with an anline whiteboard to
              plan, coordinate and discuss
            </p>
          </>
        }

      </div>
    </Card>
  );
};

export default Upload;
