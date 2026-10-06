import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Link } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { ArrowRight } from "lucide-react";
import ApplicationTable from "../Applicaton/ApplicationTable";

import { useSelector } from "react-redux";

const RecentApplicationTable = () => {
  const { applications } = useSelector((store) => store.application);

  const recent = [...applications]
    .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt))
    .slice(0, 5);

  // Applications are loaded by the Dashboard once the company is known
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between py-2">
        <CardTitle>Recent Applications</CardTitle>
        <Link to="/employer/applications">
          <Button variant="ghost">
            View All <ArrowRight />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className={"px-0"}>
        <ApplicationTable applications={recent} isFullMode={false} />
      </CardContent>
    </Card>
  );
};

export default RecentApplicationTable;
