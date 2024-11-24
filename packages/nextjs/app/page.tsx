"use client";

import { useEffect, useState } from "react";
import ExampleContractRead from "./ExampleContractRead";
import type { NextPage } from "next";

const Home: NextPage = () => {
  function ApiData(params: { address: `0x${string}` }) {
    console.log(params);
    return (
      <div className="card w-96 bg-primary text-primary-content mt-4">
        <div className="card-body">
          <h2 className="card-title">Testing API Coupling</h2>
          <p>TODO</p>
        </div>
      </div>
    );
  }
  function TokenAddressFromApi() {
    const [data, setData] = useState<{ result: string }>();
    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
      fetch("http://localhost:3001/contract-address")
        .then(res => res.json())
        .then(data => {
          setData(data);
          setLoading(false);
        });
    }, []);

    if (isLoading) return <p>Loading token address from API...</p>;
    if (!data) return <p>No token address information</p>;

    return (
      <div>
        <p>Token address from API: {data.result}</p>
        <ApiData address={data.result as `0x${string}`} />
      </div>
    );
  }
  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center mb-8">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">Scaffold-ETH 2</span>
          </h1>
          <p className="text-center text-lg">
            Get started by editing{" "}
            <code className="italic bg-base-300 text-base font-bold max-w-full break-words break-all inline-block">
              packages/nextjs/pages/index.tsx
            </code>
          </p>
          <PageBody />
          <ExampleContractRead />
          <TokenAddressFromApi />
        </div>
      </div>
    </>
  );
};

function PageBody() {
  return (
    <>
      <p className="text-center text-lg">Here we are!</p>
    </>
  );
}

export default Home;
