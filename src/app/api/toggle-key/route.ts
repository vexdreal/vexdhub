import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function POST(req:Request){

  const body = await req.json();

  const id = body.id;


  if(!id){

    return NextResponse.json({

      success:false,

      message:"ID tidak ditemukan"

    });

  }



  const key = await prisma.key.findUnique({

    where:{

      id:Number(id)

    }

  });



  if(!key){

    return NextResponse.json({

      success:false,

      message:"Key tidak ditemukan"

    });

  }




  const updated = await prisma.key.update({

    where:{

      id:Number(id)

    },


    data:{

      active:!key.active

    }


  });




  return NextResponse.json({

    success:true,

    message:"Status key berhasil diubah",

    data:updated

  });


}