import { MyFlagsProvider } from "@myflags/react";
import Flags from "./Flags";
import Flag from "./Flag";

function App(): JSX.Element {
  return (
    <MyFlagsProvider
      config={{
        apiKey: "api-key",
        environment: "development",
        projectId: "project-id",
      }}
    >
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="mx-auto max-w-2xl">
          <h1>Flags example:</h1>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <Flags />
        <Flag name="test" />
      </div>
    </MyFlagsProvider>
  );
}

export default App;
