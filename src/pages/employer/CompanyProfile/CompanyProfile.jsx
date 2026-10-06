import React from "react";
import ProfileHeader from "./ProfileHeader";
import CompanyDetails from "./CompanyDetails";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { fetchMyCompany } from "../../../reduxt-store/company/companyThunk";
import { useSelector } from "react-redux";
import CreateCompanyForm from "./CreateCompanyForm";
import { useState } from "react";

function PageHeading() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Company Profile</h1>
      <p className="text-sm text-slate-500 mt-1">
        Manage your company information and branding
      </p>
    </div>
  );
}

const CompanyProfile = () => {
  const dispatch = useDispatch();
  const { myCompany } = useSelector((state) => state.company);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    dispatch(fetchMyCompany()).finally(() => setChecked(true));
  }, [dispatch]);

  if (!checked && !myCompany) {
    return (
      <div className="space-y-5">
        <PageHeading />
        <p className="text-sm text-slate-500">Loading company...</p>
      </div>
    );
  }

  if (!myCompany) {
    return (
      <div className="space-y-5">
        <PageHeading />
        <CreateCompanyForm />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Page Heading */}
      <PageHeading />
      {/* Profile Header*/}
      <ProfileHeader />

      <CompanyDetails />
    </div>
  );
};

export default CompanyProfile;
