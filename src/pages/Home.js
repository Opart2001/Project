import Template from "../components/Template";
import Card from "../components/Card";
import homeCss from './Css/homeCss.css' // นำเข้าภาพพื้นหลัง

function Home() {

    return (
        <>
            <div className="home-background">
                <Template />
                
                    <Card>
                    </Card>
                
            </div>
        </>
    );
}

export default Home;
