import { useUser } from "@auth0/nextjs-auth0/client";
import { Inter, Montserrat } from "next/font/google";
import { useEffect, useState } from "react";
import { inputDocument, convertPDF } from "@/functions/axios";
import Alert from "@mui/material/Alert";

const montserrat = Montserrat({ subsets: ["latin"] });

export default function InputDocuments() {
  const { user } = useUser();

  useEffect(() => {
    if (!user) {
      window.location.href = "/";
    }
  }, [user]);



  const [jobDescription, setJobDescription] = useState("");
  const [coverletter, setCoverletter] = useState("");
  const [loading, setLoading] = useState(true);
  const [loading2, setLoading2] = useState(false);
  const [filename, setFileName] = useState("");
  const [textEnabled, setTextEnabled] = useState(true);
  const [formData, setFormData] = useState(null);
  const changeHandler = (event) => {
    const file = event.target.files[0]; // Get the first file from the file input

    // Create a FormData object
    const FD = new FormData();
    FD.append("pdf", file); // Append the file to the FormData object with the desired field name, in this case "file_upload"
    setFormData(FD);
    console.log("FD", FD)

    // Make the Axios POST request with the FormData object as the data
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData);
    
    if (formData != null) {
      console.log("Check");
      const text = await convertPDF(formData);
      console.log(text);
      await inputDocument(user.sub, text);
    } else {
      await inputDocument(user.sub, jobDescription);
    }
    return <Alert severity="success">Successfully added!</Alert>;
  };

  if (user) {
    return (
      <div
        className={`bg-black text-white min-h-screen px-10 py-2 ${montserrat.className}`}
      >
        <div className="flex flex-col gap-8 items-center justify-center">
          <h1 className="text-3xl font-bold mt-10">{`Let's get to know ${user.name}.`}</h1>
          <div className="flex w-screen min-h-full">
            <form
              onSubmit={handleSubmit}
              className="w-screen flex flex-col justify-center items-center gap-8"
            >
              <div className="w-screen flex flex-row justify-center items-center gap-4 text-white">
                <label className='className="px-6 py-2 text-white justify-center  hover:scale-105 active:scale-95 w-[35%] h-80 rounded-xl font-semibold border-4  border-dashed "'>
                  <span class="flex items-center space-x-2 mx-5">
                    UploadPDF
                  </span>
                  <p className="mx-5">{filename}</p>

                  <input
                    type="file"
                    name="file_upload"
                    class="hidden"
                    onChange={changeHandler}
                  />
                </label>

                <p className="text-lg font-semibold">or</p>
                <textarea
                  placeholder="Side projects, previous work roles, technical experiences..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className=" bg-slate-700 p-4 rounded-md w-[35%] h-80 overflow-y-auto outline-none resize-none"
                  disabled={!textEnabled}
                />
              </div>

              <button
                type="submit"
                className="bg-white text-black rounded-xl px-6 py-4 font-bold hover:scale-105 active:scale-95"
              >
                Teach MemGen
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }
}
