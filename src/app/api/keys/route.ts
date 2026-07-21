import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


// GET SEMUA KEY
export async function GET() {

  const keys = await prisma.key.findMany({

    orderBy:{
      createdAt:"desc",
    },

  });


  return NextResponse.json(keys);

}





// CREATE KEY
export async function POST(req:Request) {

  const body = await req.json();


  const newKey = body.key;
  const duration = body.duration;



  if(!newKey){

    return NextResponse.json({

      success:false,

      message:"Key kosong",

    });

  }




  let expiresAt = null;



  if(duration && duration !== "0"){

    const date = new Date();


    date.setDate(

      date.getDate() + Number(duration)

    );


    expiresAt = date;

  }





  const key = await prisma.key.create({

    data:{


      key:newKey,


      expiresAt,


    },


  });





  return NextResponse.json({

    success:true,

    message:"Key berhasil dibuat",

    data:key,

  });



}








// DELETE KEY / RESET DEVICE
export async function DELETE(req:Request){


  const body = await req.json();


  const id = body.id;

  const resetDevice = body.resetDevice;




  if(!id){


    return NextResponse.json({

      success:false,

      message:"ID tidak ditemukan",

    });


  }






  // RESET DEVICE

  if(resetDevice){



    await prisma.key.update({

      where:{


        id:Number(id),


      },


      data:{


        deviceId:null,


        lastUsed:null,


        useCount:0,


      },


    });





    return NextResponse.json({

      success:true,

      message:"Device berhasil direset",

    });



  }







  // HAPUS KEY PERMANEN

  await prisma.key.delete({

    where:{


      id:Number(id),


    },


  });





  return NextResponse.json({

    success:true,

    message:"Key berhasil dihapus",

  });



}