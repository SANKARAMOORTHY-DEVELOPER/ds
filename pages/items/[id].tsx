import { useRouter, withRouter } from "next/router"
import React, { Fragment, useCallback, useEffect, useState } from "react";
import Details from "./details";

function ItemDetails() {
  const router = useRouter();
  const id = router.query.id as string;

  return (
    <Details id={id} />
  )
}

export default withRouter(ItemDetails);