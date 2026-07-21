import { NextResponse } from "next/server";


export async function POST(req:Request){

  const body = await req.json();


  if(
    body.password === process.env.ADMIN_PASSWORD
  ){

    const response = NextResponse.json({
      success:true,
    });



    response.cookies.set(
      "admin_session",
      "authenticated",
      {
        httpOnly:true,
        secure:false,
        maxAge:60*60*24,
        path:"/",
      }
    );



    return response;


  }



  return NextResponse.json({

    success:false,

  });


}