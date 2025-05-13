import { Ecosystem } from "./components/Ecosystem";

export const App = () => {
  return (
    <main>
      <section>
        <h1>
          feral
          <br />
          pure internet
        </h1>
        <p>
          Built using <a href='https://bhvr.dev/'>bhvr</a> and a Raspberry Pi Zero 2.
        </p>
        <p>
          The Pi is powered by a{" "}
          <a href='https://www.amazon.com/Stealth-Cam-Rechargeable-Insulated-Compatible/dp/B0DB6LQMKH'>
            Stealth Cam Sol-Pak
          </a>{" "}
          with a built in 3000mAh battery. It outputs 10v, so a buck converter is used to step down to 5v.
        </p>
        <p>
          This is an <a href='https://github.com/iammatthias/feral-pure-internet'>open source</a> work in progress.
        </p>
      </section>

      <section>
        <h2>Ecosystem</h2>
        <p>
          Ecosystem data is provided by the <a href='https://open-meteo.com/'>Open-Meteo</a> and{" "}
          <a href='https://aqicn.org/api/'>WAQI</a> APIs for weather and air quality. We cache the results, and recheck
          every 10 minutes.
        </p>
        <Ecosystem />
      </section>

      <section>
        <h2>Etc</h2>
        <p>
          This is part of <a href='https://pure---internet.com'>PURE---INTERNET</a>, a collection of projects exploring
          novel web hosting.
        </p>
        <ul>
          <li>
            NFC:{" "}
            <a href='https://iammatthias.com/posts/1732585567703-pure-internet-bluesky'>
              https://iammatthias.com/posts/1732585567703-pure-internet-bluesky
            </a>
            <br />
            The idea was to store data URLs on an NFC tag. This fell apart because data URLs are not supported for top
            level navigation. The solution was to host minimal HTML on IPFS, and use JS to bootstrap a data URL from a
            url param into an iframe.
          </li>
          <li>
            Bluesky:{" "}
            <a href='https://iammatthias.com/posts/1732585567703-pure-internet-bluesky'>
              https://iammatthias.com/posts/1732585567703-pure-internet-bluesky
            </a>
            <br />
            This was a fun experiment inspired by{" "}
            <a href='https://danielmangum.com/posts/this-website-is-hosted-on-bluesky/'>Daniel Mangum's prior work</a>.
            It leverages a few pieces of Bluesky's underlying AtProtocol, namely the Personal Data Server (PDS) and
            content addressable blob storage.
          </li>
        </ul>
      </section>
    </main>
  );
};
