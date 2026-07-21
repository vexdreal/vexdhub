"use client";

import { useEffect, useState } from "react";


export default function LicensePage() {


  const [key, setKey] = useState("");

  const [device, setDevice] = useState("");

  const [message, setMessage] = useState("");

  const [success, setSuccess] = useState(false);

  const [data, setData] = useState<any>(null);




  useEffect(() => {


    // AUTO DEVICE ID

    let savedDevice = localStorage.getItem(
      "vexdhub_device"
    );



    if (!savedDevice) {


      savedDevice =
        "VEXD-" +
        crypto.randomUUID();



      localStorage.setItem(

        "vexdhub_device",

        savedDevice

      );


    }



    setDevice(savedDevice);





    // LOAD SAVED LICENSE KEY

    const savedKey = localStorage.getItem(
      "vexdhub_key"
    );



    if (savedKey) {

      setKey(savedKey);

    }



  }, []);







  async function verify() {


    if (!key) {


      setMessage(
        "Masukkan license key"
      );


      return;


    }





    setMessage(
      "Checking license..."
    );


    setSuccess(false);





    const res = await fetch(
      "/api/verify-license",
      {

        method: "POST",

        headers: {

          "Content-Type":
          "application/json",

        },


        body: JSON.stringify({

          key,

          deviceId: device,

        }),


      }

    );






    const result = await res.json();





    setMessage(
      result.message
    );





    if (result.success) {


      setSuccess(true);


      setData(result);




      // SAVE LICENSE

      localStorage.setItem(

        "vexdhub_key",

        key

      );


    }



  }









  function clearLicense(){


    localStorage.removeItem(
      "vexdhub_key"
    );


    setKey("");

    setData(null);

    setSuccess(false);


    setMessage(
      "License berhasil dihapus"
    );


  }









  return (


    <main>


      <div className="login-card">



        <h1>

          VexdHub License

        </h1>




        <p>

          License Verification

        </p>







        <input


          placeholder="License Key"


          value={key}


          onChange={(e)=>

            setKey(e.target.value)

          }


        />







        <input


          placeholder="Device ID"


          value={device}


          readOnly


        />







        <div>


          <button

            onClick={verify}

          >

            Verify License

          </button>





          <button


            onClick={clearLicense}


            style={{

              marginLeft:"10px",

            }}


          >

            Clear License

          </button>



        </div>









        {

          message && (


            <p


              style={{


                marginTop:"20px",


                color:

                success

                ?

                "green"

                :

                "red",


              }}


            >

              {message}


            </p>


          )


        }









        {


          success && data && (



            <div


              style={{


                marginTop:"20px",


                border:"1px solid #444",


                padding:"15px",


                borderRadius:"10px",


              }}


            >




              <h2>

                ✅ License Active

              </h2>






              <p>


                <b>

                  Key

                </b>


                <br/>


                {key}


              </p>







              <p>


                <b>

                  Device

                </b>


                <br/>


                {device}


              </p>







              {


                data.expiresAt && (



                  <p>


                    <b>

                      Expired

                    </b>


                    <br/>



                    {


                      new Date(

                        data.expiresAt

                      ).toLocaleString()



                    }


                  </p>



                )



              }






            </div>



          )


        }







      </div>


    </main>


  );


}