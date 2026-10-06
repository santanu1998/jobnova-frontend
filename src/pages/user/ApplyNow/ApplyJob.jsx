import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import JobInfoCard from "./JobInfoCard";
import ApplySteps from "./ApplySteps";
import SelectResume from "./SelectResume";
import CoverLetterEditor from "./CoverLetterEditor";
import AdditionalDetails from "./AdditionalDetails";
import ReviewSubmit from "./ReviewSubmit";
import { submitApplication } from "../../../reduxt-store/application/applicationThunk";
import { fetchJobById } from "../../../reduxt-store/job/jobThunk";

const COVER_LETTER_LIMIT = 3000;

const ApplyJob = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedResume, setSelectedResume] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [expectedSalary, setExpectedSalary] = useState("");
  const [availableFrom, setAvailableFrom] = useState(null);
  const [stepError, setStepError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const dispatch = useDispatch();
  const { currentJob: job } = useSelector((store) => store.job);
  const { id } = useParams();

  useEffect(() => {
    if (id) dispatch(fetchJobById(id));
  }, [id, dispatch]);

  const validateStep = (step) => {
    if (step === 1 && !selectedResume) return "Please select a resume to continue.";
    if (step === 2 && coverLetter.length > COVER_LETTER_LIMIT)
      return `Cover letter must not exceed ${COVER_LETTER_LIMIT} characters.`;
    if (step === 3 && expectedSalary !== "" && Number(expectedSalary) < 0)
      return "Expected salary must not be negative.";
    return "";
  };

  const goNext = () => {
    const err = validateStep(currentStep);
    setStepError(err);
    if (!err) setCurrentStep((prev) => prev + 1);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <SelectResume selectedResume={selectedResume} setSelectedResume={setSelectedResume} />
        );
      case 2:
        return (
          <CoverLetterEditor
            coverLetter={coverLetter}
            setCoverLetter={setCoverLetter}
            selectedResume={selectedResume}
            limit={COVER_LETTER_LIMIT}
          />
        );
      case 3:
        return (
          <AdditionalDetails
            expectedSalary={expectedSalary}
            setExpectedSalary={setExpectedSalary}
            availableFrom={availableFrom}
            setAvailableFrom={setAvailableFrom}
          />
        );
      case 4:
        return (
          <ReviewSubmit
            selectedResume={selectedResume}
            coverLetter={coverLetter}
            expectedSalary={expectedSalary}
            availableFrom={availableFrom}
            job={job}
          />
        );
      default:
        return null;
    }
  };

  const handleSubmit = async () => {
    setSubmitError("");
    setSubmitting(true);
    const result = await dispatch(
      submitApplication({
        jobId: Number(id),
        resumeId: Number(selectedResume),
        coverLetter: coverLetter.trim() || null,
        expectedSalary: expectedSalary === "" ? null : Number(expectedSalary),
        // Application-Service expects a LocalDate (yyyy-MM-dd)
        availableFrom: availableFrom ? format(availableFrom, "yyyy-MM-dd") : null,
      }),
    );
    setSubmitting(false);
    if (submitApplication.fulfilled.match(result)) {
      navigate("/applications", { replace: true });
    } else {
      setSubmitError(result.payload || "Failed to submit application");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Button className={"py-5"} variant="ghost" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back To Job
      </Button>

      <JobInfoCard job={job} />

      <ApplySteps currentStep={currentStep} />

      <div className="my-8">{renderStep()}</div>

      {(stepError || submitError) && (
        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {stepError || submitError}
        </div>
      )}

      <div className="flex items-center justify-between mt-8">
        <Button
          disabled={currentStep === 1 || submitting}
          variant="outline"
          onClick={() => {
            setStepError("");
            setCurrentStep((prev) => prev - 1);
          }}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        {currentStep < 4 ? (
          <Button onClick={goNext}>
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={submitting || !job}>
            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Submit Application
          </Button>
        )}
      </div>
    </div>
  );
};

export default ApplyJob;
