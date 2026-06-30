import { useState, useEffect } from "react";
import JobCard from "../components/JobCard";
import api from "../api/axios";
import { Button } from "antd";

export default function SavedJobs() {
  const [jobs, setJobs] = useState(null);

  useEffect(() => {
    api.get("/users/saved-jobs").then(({ data }) => setJobs(data));
  }, []);

  const handleRemoveJob = async (jobId) => {
    try {
      const response = await api.put(`/users/saved-jobs/${jobId}`);

      if (response.data.saved === false) {
        setJobs((prevJobs) => prevJobs.filter((job) => job._id !== jobId));
      }
    } catch (error) {
      console.error("Xatolik yuz berdi:", error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      <h1 className="font-display text-2xl font-semibold mb-6">
        Saqlangan vakansiyalar
      </h1>

      {!jobs ? (
        <p className="text-muted text-center py-16">Yuklanmoqda...</p>
      ) : jobs.length === 0 ? (
        <p className="text-muted text-center py-16">
          Hozircha saqlangan vakansiyalar yo'q
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-y-12 gap-x-4">
          {jobs.map((job) => (
            <div key={job._id} className="relative group pt-4 pb-8">
              {/* Katta Card */}
              <div className="transition-all duration-300 transform group-hover:-translate-y-1.5 group-hover:shadow-md rounded-2xl">
                <JobCard job={job} />
              </div>

              <div className="absolute bottom-1 left-4 opacity-0 pointer-events-none transform translate-y-0 transition-all duration-300 group-hover:opacity-100 group-hover:pointer-events-auto group-hover:translate-y-3 z-10">
                <Button
                  onClick={() => handleRemoveJob(job._id)}
                  variant="solid"
                  color="danger"
                  className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:bg-gray-50 whitespace-nowrap"
                >
                  Saqlanganlardan o'chirish
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
