import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function POST(req: Request) {

  try {

    const body = await req.json();

    const {
      key,
      deviceId
    } = body;


    if (!key || !deviceId) {

      return NextResponse.json({
        success:false,
        message:"Data tidak lengkap"
      });

    }


    const license = await prisma.key.findUnique({
      where:{
        key
      }
    });



    if(!license){

      return NextResponse.json({
        success:false,
        message:"Key tidak ditemukan"
      });

    }



    if(!license.active){

      return NextResponse.json({
        success:false,
        message:"Key tidak aktif"
      });

    }



    if(
      license.expiresAt &&
      new Date() > license.expiresAt
    ){

      return NextResponse.json({
        success:false,
        message:"Key expired"
      });

    }



    if(
      license.deviceId &&
      license.deviceId !== deviceId
    ){

      return NextResponse.json({
        success:false,
        message:"Key sudah digunakan device lain"
      });

    }



    if(!license.deviceId){

      await prisma.key.update({

        where:{
          id:license.id
        },

        data:{
          deviceId
        }

      });

    }



    return NextResponse.json({

      success:true,

      message:"License OK",

      expiresAt:license.expiresAt

    });



  } catch(error){


    return NextResponse.json({

      success:false,

      message:"Server error"

    });


  }

}