import React, { Component } from 'react';
import {
    Alert,
    Jumbotron,
    ListGroup,
    ListGroupItem,
    Spinner,
    Button,
    Row, Col, Card,
    Input, FormGroup
} from 'reactstrap';
import { ProgressBar } from 'react-bootstrap';
import Chart from 'react-google-charts';
import { Link } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getPosts, addPost } from '../actions/postActions';
import MarkdownIt from 'markdown-it';
import DOMPurify from "dompurify";
import { OpenAI } from "openai";

const mdParser = new MarkdownIt();

const api = new OpenAI({
    apiKey: process.env.REACT_APP_OPENAI_KEY,
    baseURL: "https://api.aimlapi.com/v1",
    dangerouslyAllowBrowser: true,
});

class PostsList extends Component {
    state = {
        bandwidth: null,
        usageData: [
            ['Country', 'Utilization'],
            ['UG', 60], ['EG', 40], ['NG', 50], ['CD', 30], ['ZA', 45],
            ['KE', 55], ['GH', 35], ['ET', 65], ['MA', 50], ['TN', 40],
            ['ZM', 60], ['SD', 45], ['SN', 30], ['CM', 55], ['ZW', 35],
            ['MZ', 70], ['ML', 25], ['BF', 50], ['MG', 45], ['NE', 60],
            ['MU', 40], ['BW', 50], ['ER', 35], ['BI', 55], ['LS', 30]
        ],
        utilization: 60,
        aiResponse: "Click 'Get AI Insights' to generate insights.",
        userQuery: ""
    };

    componentDidMount() {
        this.props.getPosts();
        this.measureBandwidth();
        this.startDataSimulation();
    }

    measureBandwidth = () => {
        const imageUrl = "https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png";
        const startTime = new Date().getTime();
        
        const img = new Image();
        img.src = imageUrl + "?t=" + startTime;
        img.onload = () => {
            const endTime = new Date().getTime();
            const duration = (endTime - startTime) / 1000;
            const fileSize = 14 * 1024;
            const speed = (fileSize / duration) / 1024;
            
            this.setState({ bandwidth: speed.toFixed(2) + " KBps" });
        };
    };

    startDataSimulation = () => {
        setInterval(() => {
            this.setState({
				usageData: this.state.usageData.map(([country, value], index) =>
                    index === 0 ? [country, value] : [country, Math.floor(Math.random() * 80) + 20]
                ),
				utilization: Math.floor(Math.random() * 80) + 20
            });
        }, 3000);
    };

    handleInputChange = (event) => {
        this.setState({ userQuery: event.target.value });
    };

    getAIInsights = async () => {
        const systemPrompt = "You are a network analyst providing insights on resource utilization.";
        const userPrompt = this.state.userQuery || "Analyze the network usage data and suggest improvements.";
        
        try {
            const completion = await api.chat.completions.create({
                model: "mistralai/Mistral-7B-Instruct-v0.2",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt },
                ],
                temperature: 0.7,
                max_tokens: 256,
            });
            
            const response = completion.choices[0].message.content;
            this.setState({ aiResponse: response });
        } catch (error) {
            console.error("Error fetching AI insights:", error);
            this.setState({ aiResponse: "Failed to fetch AI insights. Please try again later." });
        }
    };

    render() {
        const { posts, loading } = this.props.post;
        const { bandwidth, aiResponse, userQuery, utilization } = this.state;
        
        return (
            <div>
                <Jumbotron className="text-center">
                    <h1 className="display-4">Welcome to KONEKTA Forum!</h1>
                    <p className="lead">KONEKTA – Connecting Africa Through Knowledge, Innovation, and Technology. 🚀</p>
                    <hr className="my-2" />
                    <p>If you haven't done yet, we recommend you to <Link to="/register">register a new account here</Link>.</p>
					<p>Join discussions across Africa! 🌍✨ {`🇺🇬 🇪🇬 🇳🇬 🇿🇦 🇰🇪 🇬🇭 🇪🇹 🇲🇦 🇨🇩 🇹🇳 🇿🇲 🇸🇩 🇸🇳 🇨🇲 🇿🇼 🇲🇿 🇲🇱 🇧🇫 🇲🇬 🇳🇪 🇲🇺 🇧🇼 🇪🇷 🇧🇮 🇱🇸 🇬🇲 🇱🇾 🇹🇬 🇸🇨 🇨🇫 🇹🇩 🇲🇼 🇩🇯`}</p>

                    {bandwidth && <p className="text-muted">Network Speed: {bandwidth}</p>}
                </Jumbotron>

                <Row className="mt-4">
                    <Col md={6}>
                        <Card className="p-3 h-100">
                            <h5>AI-Powered Network Resource Insights</h5>
                            <p>Analyzing digital infrastructure utilization across Africa.</p>
                            <ProgressBar now={utilization} label={`${utilization}% Utilized`} variant="success" className="mb-3" />
                            <ProgressBar now={100 - utilization} label={`${100 - utilization}% Available`} variant="warning" />
                        </Card>
                    </Col>
                    <Col md={6}>
                        <Card className="p-3 h-100">
                            <h5>Resource Utilization Heatmap</h5>
                            <Chart
                                chartType="GeoChart"
                                width="100%"
                                height="300px"
                                data={this.state.usageData}
                                options={{
                                    region: '002', // Africa region
                                    displayMode: 'regions',
                                    colorAxis: { colors: ['#ffc107', '#28a745'] }
                                }}
                            />
                        </Card>
                    </Col>
                </Row>
                
                <Row className="mt-4">
                    <Col md={12}>
                        <Card className="p-3">
                            <h5>AI-Generated Network Insights</h5>
                            <FormGroup>
                                <Input type="text" value={userQuery} onChange={this.handleInputChange} placeholder="Type your question here..." />
                            </FormGroup>
                            <p>{aiResponse}</p>
                            <Button color="primary" onClick={this.getAIInsights}>Get AI Insights</Button>
                        </Card>
                    </Col>
                </Row>
				{loading ? (
                    <div className="w-100 d-flex justify-content-center">
                        <Spinner type="grow" color="primary" style={{ width: '3rem', height: '3rem' }} />
                    </div>
                ) : (
                    <ListGroup className="mt-4">
                        <TransitionGroup className="posts-list">
                            {posts.map(({ _id, title, content }) => (
                                <CSSTransition key={_id} timeout={500} classNames="fade" appear>
                                    <ListGroupItem className="py-4 shadow-sm border rounded bg-light mb-3">
                                        <h3 className="text-primary">{title}</h3>
                                        <div
                                            className="text-muted"
                                            dangerouslySetInnerHTML={{
                                                __html: DOMPurify.sanitize(mdParser.render(content)),
                                            }}
                                        />
                                        <div className="mt-3 d-flex justify-content-end">
                                            <Link to={`/post/${_id}`}>
                                                <Button color="primary">Read More</Button>
                                            </Link>
                                        </div>
                                    </ListGroupItem>
                                </CSSTransition>
                            ))}
                        </TransitionGroup>
                    </ListGroup>
                )}
            </div>
        );
    }
}

const mapStateToProps = (state) => ({ post: state.post, isAuthenticated: state.auth.isAuthenticated });
export default connect(mapStateToProps, { getPosts, addPost })(PostsList);
