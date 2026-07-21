"use client";

type Props = {
  title:string;
  value:number;
};


export default function StatsCard({
  title,
  value,
}:Props){

  return (

    <div
      style={{
        border:"1px solid #444",
        padding:"20px",
        borderRadius:"15px",
        margin:"10px",
      }}
    >

      <h3>
        {title}
      </h3>


      <h1>
        {value}
      </h1>


    </div>

  );

}