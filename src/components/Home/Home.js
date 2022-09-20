import React, { useState, useEffect } from "react";
import bgImg from "../../asset/restaurant.jpg";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import "./Home.css";

const Tip = (props) => {
  const [walletId, setWalletId] = useState("");
  const [message, setMessage] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [amount, setAmount] = useState(0);
  const [nameIsValid, setNameIsValid] = useState(true);

  const setWalletAddressFunc = async (namesTaken) => {
    if (!namesTaken.includes(walletId)) {
      setWalletAddress("");
      setNameIsValid(false);
      return;
    } else {
      setNameIsValid(true);
      const wid = await props.checkAddress(walletId);
      setWalletAddress(wid);
    }
  };

  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header>
        <Modal.Title id="contained-modal-title-vcenter">
          Tip a staff
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3" controlId="formUniqueIdentifier">
            <Form.Group className="mb-3" controlId="formMessage">
              <Form.Label>Message</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </Form.Group>
            <Form.Label>Enter staff wallet identifier</Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g alice.dac"
              value={walletId}
              onChange={(e) => setWalletId(e.target.value)}
            />
            <Button onClick={() => setWalletAddressFunc(props.namesTaken)}>
              Check
            </Button>
            <div className="check-avail check-avail-f" hidden={nameIsValid}>
              Invalid wallet identifier
            </div>
          </Form.Group>
          <Form.Group className="mb-3" controlId="formWalletAddress">
            <Form.Label>Wallet Address</Form.Label>
            <Form.Control type="text" disabled={true} value={walletAddress} />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formAmount">
            <Form.Label>Amount (CELO)</Form.Label>
            <Form.Control
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </Form.Group>
          <Button onClick={props.onHide}>Close</Button>
          <Button
            variant="primary"
            onClick={async () =>
              props.tip(message, walletId, walletAddress, amount)
            }
          >
            Tip
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

const Register = (props) => {
  const [uniqueId, setUniqueId] = useState("");
  const [associatedWallet, setAssociatedWallet] = useState("");
  const [unique, setUnique] = useState(true);

  const nameIsUnique = () => {
    const uid = uniqueId + ".dac";
    let nt = props.namesTaken;
    if (nt?.includes(uid)) {
      setUnique(false);
    } else {
      setUnique(true);
    }
  };

  useEffect(() => {
    nameIsUnique();
  }, [uniqueId]);

  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header>
        <Modal.Title id="contained-modal-title-vcenter">
          Register as a staff
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3" controlId="formUniqueIdentifier">
            <Form.Label>Enter your unique identifier</Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g alice"
              value={uniqueId}
              onChange={(e) => setUniqueId(e.target.value)}
            />
            <Form.Text className="text-muted">
              Your unique identifier will be append with a ".dac" extension.
              Example, <span className="form-highlight">alice</span> will
              resolve to <span className="form-highlight">alice.dac</span>
            </Form.Text>
            <div
              className="check-avail check-avail-f"
              hidden={unique || !uniqueId}
            >
              "{uniqueId}.dac" is already taken
            </div>
            <div
              className="check-avail check-avail-s"
              hidden={!unique || !uniqueId}
            >
              "{uniqueId}.dac" is available
            </div>
          </Form.Group>

          <Form.Group className="mb-3" controlId="formWalletAddress">
            <Form.Label>Your wallet Address</Form.Label>
            <Form.Control
              type="text"
              value={props.userWallet}
              disabled={true}
            />
          </Form.Group>
          <Button onClick={props.onHide}>Close</Button>
          <Button
            variant="primary"
            type="button"
            onClick={() => props.register(uniqueId, associatedWallet)}
          >
            Register
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

const Home = ({ bal, namesTaken, register, tip, checkAddress, userWallet }) => {
  const [showTipModal, setShowTipModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  return (
    <>
      {namesTaken.length ? (
        <div className="home">
          <img className="bg-img" src={bgImg} />
          <div className="balance">Balance: {bal} CELO</div>
          <div className="home-body">
            <div className="home-welcome-msg">
              Welcome to the world's first decentralised restaurant
            </div>
            <div className="home-ques">What would you like to do?</div>
            <div className="home-btns">
              <Tip
                show={showTipModal}
                onHide={() => setShowTipModal(false)}
                namesTaken={namesTaken}
                checkAddress={checkAddress}
                tip={tip}
              />
              <button
                className="home-btn"
                onClick={() => setShowTipModal(true)}
              >
                Tip
              </button>
              <Register
                show={showRegisterModal}
                onHide={() => setShowRegisterModal(false)}
                namesTaken={namesTaken}
                register={register}
                userWallet={userWallet}
              />
              <button
                className="home-btn"
                onClick={() => setShowRegisterModal(true)}
              >
                Register
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div>Connecting to contract...</div>
      )}
    </>
  );
};

export default Home;
