"use client";
import React, { useEffect, useState } from 'react'
import { SignedIn, SignedOut, UserButton, SignInButton } from '@clerk/nextjs'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from './ui/button';
import { LayoutDashboard, PenBox, TrendingUp, Calculator } from 'lucide-react';

const Header = () => {
  return (
    <div className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b"> 
    <nav className="container mx-auto px-4 flex items-center justify-between">
    <div className="flex items-center">
      <Link href="/" className="flex items-center">
        <Image src={"/logo.png"}
          alt="finFlow logo"
          height={100}
          width={80} 
          className="object-contain"
        />
        <Image src={"/logo-usifresa.png"}
          alt="Usifresa Logo"
          height={100}
          width={80} 
          className="object-contain"
        />
      </Link>
    </div>

    <div className="flex items-center space-x-4">
    <SignedIn>
      <Link href={"/dashboard"}
      className="text-gray-600 hover:text-blue-600 flex items-center gap-2">
      <Button variant="outline">
        <LayoutDashboard size={18} />
        <span className="hidden md:inline">Dashboard</span>
        </Button>
      </Link>

      <Link href={"/simulator"}
      className="text-gray-600 hover:text-blue-600 flex items-center gap-2">
      <Button variant="outline">
        <Calculator size={18} />
        <span className="hidden md:inline">Simulador</span>
        </Button>
      </Link>

      <Link href={"/prediction"}
      className="text-gray-600 hover:text-blue-600 flex items-center gap-2">
      <Button variant="outline">
        <TrendingUp size={18} />
        <span className="hidden md:inline">Previsões</span>
        </Button>
      </Link>

      <Link href={"/transaction/create"}>
      <Button className="flex items-center gap-2">
        <PenBox size={18} />
        <span className="hidden md:inline">Add Transação</span>
        </Button>
      </Link>
    </SignedIn>
    </div>

      <SignedOut>
        <SignInButton forceRedirectUrl="/dashboard">
        <Button variant="outline">Login</Button>
    </SignInButton >
  </SignedOut>
  <SignedIn>
    <UserButton appearance={{
      elements: {
        avatarBox: "h-10 w-10",
      }
    }} />
  </SignedIn>
  </nav>
  </div>
  );
};

export default Header
