import { Fragment, useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import useAuth from "../../hooks/useAuth";
import requests from "../../services/requests";
import Logout from "../../assets/img/logout.svg";
import PlusCircle from "../../assets/img/plus-circle.svg";
import MinusCircle from "../../assets/img/minus-circle.svg";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import { TailSpin } from  'react-loader-spinner';
import { 
  Container, 
  Content, 
  Header, 
  Title, 
  Movements, 
  MovementsContent,
  Footer, 
  Hyperlink,
  Movement,
  MovementDate,
  MovementDescription,
  MovementValue, 
  TitleBalance,
  ValueBalance } from "../../components/Balance";

export default function Balance() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const [movements, setMovements] = useState(null);
  const [isLoading, setIsloading] = useState(false);

  useEffect(() =>{
    setIsloading(true);
    const promise = requests.getBalance(auth.token);
    setTimeout(() => {
      promise.then((response) => {
        setIsloading(false);

        setMovements(response.data);
      });
    }, 2000);
    setTimeout(() => {
      promise.catch(() => {
        setIsloading(false);

        alert("Não foi possível buscar as movimentações. Ocorreu um erro inesperado, tente novamente!");
      });
    }, 2000);
  }, [auth.token]);

  const movementsReader = movements?.map((movement) => {
    return(
      <Fragment key={movement._id}>
        <Movement>
          <div>
            <MovementDate>{movement.date}</MovementDate>
            <MovementDescription>{movement.description}</MovementDescription>
          </div>
          <MovementValue isInput={movement.isInput}>{movement.value}</MovementValue>
        </Movement>
      </Fragment>
    );
  })

  const balanceReader = movements?.map(movement => movement.isInput ? parseInt(movement.value.replace(',', '')) : -1 * parseInt(movement.value.replace(',', '')));
  const balanceResult = balanceReader?.reduce((partialSum, a) => partialSum + a, 0);

  const balanceInputReader = movements?.map(movement => movement.isInput === true && parseInt(movement.value.replace(',', '')));
  const balanceOutputReader = movements?.map(movement => movement.isInput === false && -1 * parseInt(movement.value.replace(',', '')));
  const balanceInputResult = balanceInputReader?.reduce((partialSum, a) => partialSum + a, 0);
  const balanceOutputResult = balanceOutputReader?.reduce((partialSum, a) => partialSum + a, 0);
  const balanceWalletResult = balanceInputResult > -1 * balanceOutputResult;

  function handleCurrency(value) {
    let inputValue = value;
    
    inputValue = inputValue + '';
    inputValue = parseInt(inputValue.replace(/[\D]+/g,''));
    inputValue = inputValue + '';
    inputValue = inputValue.replace(/([0-9]{2})$/g, ",$1");

    if (inputValue.length > 6) {
      inputValue = inputValue.replace(/([0-9]{3}),([0-9]{2}$)/g, "$1,$2");
    }

    return inputValue;
  }

  function handleLogout() {
    if(window.confirm("Deseja realmente sair da seção atual?")){
      logout();
      navigate("/");
    }else{
      return;
    }
  }

  return(
    <Fragment>
      <Container>
        <Content>
          <Header>
            <Title>
              {`Olá, ${auth.name}`}
            </Title>

            <button onClick={handleLogout}>
              <img alt="logout.svg" src={Logout}/>
            </button>
          </Header>

          <Movements stageMovements={movements} stageisLoading={isLoading}>
            {
              movements === null ?
                <TailSpin color="#9156BE" height={80} width={80} />
              :
                movements.length === 0 ?
                  <span>
                    Não há registros de <br />
                    entrada ou saída
                  </span>
                :
                <MovementsContent>
                  {movementsReader}
                </MovementsContent>
            }

            {
              movements !== null &&
                movements.length !== 0 &&
                  <footer>
                    <TitleBalance>SALDO</TitleBalance>
                    <ValueBalance balanceWalletResult={balanceWalletResult}>
                      {handleCurrency(balanceResult?.toString())}
                    </ValueBalance>
                  </footer>
            }
          </Movements>

          <Footer>
            <Hyperlink to="/input">
              <img alt="plus-circle.svg" src={PlusCircle} />

              Nova <br />
              entrada
            </Hyperlink>

            <Hyperlink to="/output">
              <img alt="minus-circle.svg" src={MinusCircle} />

              Nova <br />
              saída
            </Hyperlink>
          </Footer>
        </Content>
      </Container>
    </Fragment>
  );
}