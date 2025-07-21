import Hero from "../components/Hero";
import SimpleApp from "../components/SimpleApp";
import Accuracy from "../components/Accuracy";
import Integration from "../components/Integration";
import Benefits from "../components/Benefits";
import CallToAction from "../components/CallToAction";
import Meta from "../components/Meta";

const Home = () => {
  return (
    <>
      <Meta
        title="Jawbreaker | 15 minutes OASIS"
        description="Chart an OASIS in under 15 minutes. Improve accuracy, boost productivity, and end clinician burnout with Jawbreaker."
      />
      <Hero />
      <SimpleApp />
      <Accuracy />
      <Integration />
      <Benefits />
      <CallToAction />
    </>
  );
};

export default Home;
