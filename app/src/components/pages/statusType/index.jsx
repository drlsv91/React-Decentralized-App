import React, { useState } from 'react';
import { Formik, Form, useField } from "formik";
import { drizzleReactHooks } from "@drizzle/react-plugin"
import SimpleAlerts from '../../alert'
import * as Yup from "yup";
import DashBoardLayout from '../../layout/dashboardLayout'
import './index.css'

const MyTextInput = ({ label, ...props }) => {
    const [field, meta] = useField(props);
    return (
      <>
        <label className="label__container" htmlFor={props.id || props.name}>{label}</label>
        <input className="text-input" {...field} {...props} />
          <div className={meta.touched && meta.error ? 'error_active' : 'error_hidden'}>{meta.error|| "hello"}</div>
      </>
    );
  };

const StatusType = () => {
    const [stackId, setStackId] = useState(null);
    const { useDrizzle, useDrizzleState } = drizzleReactHooks;
    const {drizzle} = useDrizzle();
    const state = useDrizzleState(state => state);

    // get the transaction states from the drizzle state
    const { transactions, transactionStack } = state;
    const getTxStatus = () => {
        // get the transaction hash using our saved `stackId`
        const txHash = transactionStack[stackId];
        // if transaction hash does not exist, don't display anything
        if (!txHash) return null;

          return transactions[txHash] && (
            <SimpleAlerts 
            severity={transactions[txHash].status}
            message={`transaction ${transactions[txHash].status}`}
            ></SimpleAlerts>
            );
    }
   const submitStatus = (name) => {
        const contract = drizzle.contracts.JurStatus;
          // let drizzle know we want to call the `addStatusType` method with `value`
        const Id = contract.methods["addStatusType"].cacheSend(name, {
        from: state.accounts[0]
      });
        setStackId(Id);
    }

    const StatusForm = () => {
        return (
          <section className="status__container">
            <Formik
              initialValues={{
                statusType: ""
              }}
              validationSchema={Yup.object({
                statusType: Yup.string()
                  .max(15, "Must be 15 characters or less")
                  .min(2, "minimum of two char")
                  .required("status Type is Required")
              })}
              onSubmit={async (values, { setSubmitting }) => {
               submitStatus(values.statusType);
               setSubmitting(false);
              }}
            >
             {({ isSubmitting }) => (
              <Form className="form">
                <MyTextInput
                  label="StatusType"
                  name="statusType"
                  type="text"
                  placeholder="active"
                />
                <button type="submit" className="submit__active" disabled={isSubmitting}>Submit</button>
              </Form>
             )}
            </Formik>
          </section>
        );
      };


    return (
        <section>
            <DashBoardLayout>
            <div>{getTxStatus()}</div>
            <StatusForm />   
            </DashBoardLayout>
        </section>
    );
};

export default StatusType;